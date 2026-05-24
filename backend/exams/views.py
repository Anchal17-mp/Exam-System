from rest_framework import generics, permissions # type: ignore
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Exam, Question, Result,CheatingLog
from .serializers import ExamSerializer, ResultSerializer

# Student sees ALL exams from ALL tutors
class ExamListView(generics.ListAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

# Tutor sees only THEIR exams
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_exams(request):
    try:
        if request.user.profile.role != 'tutor':
            return Response({'error': 'Only tutors can access this'}, status=403)
    except Exception as e:
        return Response({'error': f'Profile error: {str(e)}'}, status=400)

    exams = Exam.objects.filter(created_by=request.user)
    serializer = ExamSerializer(exams, many=True)
    return Response(serializer.data)

# Tutor creates exam with questions
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_exam(request):
    print(f"=== CREATE EXAM ===")
    print(f"User: {request.user.username}")
    print(f"Data: {request.data}")

    try:
        role = request.user.profile.role
        print(f"Role: {role}")
    except Exception as e:
        print(f"Profile error: {e}")
        return Response({'error': 'User profile not found'}, status=400)

    if role != 'tutor':
        return Response({'error': 'Only tutors can create exams'}, status=403)

    title = request.data.get('title', '').strip()
    description = request.data.get('description', '')
    duration_minutes = request.data.get('duration_minutes', 30)
    questions_data = request.data.get('questions', [])

    print(f"Title: {title}")
    print(f"Questions count: {len(questions_data)}")

    if not title:
        return Response({'error': 'Title is required'}, status=400)

    if len(questions_data) == 0:
        return Response({'error': 'At least one question is required'}, status=400)

    # Create exam
    exam = Exam.objects.create(
        title=title,
        description=description,
        duration_minutes=duration_minutes,
        created_by=request.user
    )

    print(f"Exam created with ID: {exam.id}")

    # Create questions
    for q_data in questions_data:
        Question.objects.create(
            exam=exam,
            text=q_data.get('text', ''),
            option_a=q_data.get('option_a', ''),
            option_b=q_data.get('option_b', ''),
            option_c=q_data.get('option_c', ''),
            option_d=q_data.get('option_d', ''),
            correct_option=q_data.get('correct_option', 'a')
        )

    print(f"Questions created: {exam.questions.count()}")

    return Response({
        'id': exam.id,
        'title': exam.title,
        'questions_count': exam.questions.count()
    }, status=201)

class ExamDetailView(generics.RetrieveAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_exam(request):
    exam_id = request.data.get('exam_id')
    answers = request.data.get('answers', {})

    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)

    questions = Question.objects.filter(exam=exam)
    score = 0
    review_data = []

    for question in questions:
        selected = answers.get(str(question.id))
        is_correct = selected == question.correct_option
        if is_correct:
            score += 1

        review_data.append({
            'id': question.id,
            'text': question.text,
            'option_a': question.option_a,
            'option_b': question.option_b,
            'option_c': question.option_c,
            'option_d': question.option_d,
            'correct_option': question.correct_option,
            'selected_option': selected,
            'is_correct': is_correct,
        })

    total = questions.count()

    Result.objects.create(
        student=request.user,
        exam=exam,
        score=score,
        total=total
    )

    return Response({
        'score': score,
        'total': total,
        'review': review_data,
        'exam_title': exam.title,
    })
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_results(request):
    results = Result.objects.filter(student=request.user)
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tutor_results(request):
    try:
        if request.user.profile.role != 'tutor':
            return Response({'error': 'Only tutors can access this'}, status=403)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

    my_exams = Exam.objects.filter(created_by=request.user)
    results = Result.objects.filter(exam__in=my_exams)
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tutors_report(request):
    from django.contrib.auth.models import User
    tutors = User.objects.filter(profile__role='tutor')
    data = []
    for tutor in tutors:
        exams = Exam.objects.filter(created_by=tutor)
        question_count = sum(e.questions.count() for e in exams)
        data.append({
            'id': tutor.id,
            'username': tutor.username,
            'email': tutor.email,
            'exam_count': exams.count(),
            'question_count': question_count,
        })
    return Response(data)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_questions(request):
    topic = request.data.get('topic', '')
    count = request.data.get('count', 5)

    if not topic:
        return Response({'error': 'Topic is required'}, status=400)

    try:
        from groq import Groq
        from django.conf import settings
        import json
        import re

        client = Groq(api_key=settings.GROQ_API_KEY)

        prompt = f"""Generate exactly {count} multiple choice questions about "{topic}".
Return ONLY a valid JSON array. No markdown, no explanation, no extra text.
Use this exact format:
[
  {{
    "text": "Question here?",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_option": "a"
  }}
]
correct_option must be exactly one of: a, b, c, or d.
Make all questions clear and educational."""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            max_tokens=2000,
            temperature=0.7,
        )

        response_text = chat_completion.choices[0].message.content.strip()
        print(f"Groq response: {response_text}")

        clean_text = re.sub(r'```json|```', '', response_text).strip()
        questions = json.loads(clean_text)

        return Response({'questions': questions, 'count': len(questions)})

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return Response({'error': 'Failed to parse AI response'}, status=500)
    except Exception as e:
        print(f"Groq error: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_exam(request, pk):
    try:
        exam = Exam.objects.get(id=pk, created_by=request.user)
        exam.delete()
        return Response({'message': 'Exam deleted successfully'}, status=200)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found or not authorized'}, status=404)

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def edit_exam(request, pk):
    try:
        exam = Exam.objects.get(id=pk, created_by=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found or not authorized'}, status=404)

    if request.method == 'GET':
        serializer = ExamSerializer(exam)
        return Response(serializer.data)

    if request.method == 'PUT':
        title = request.data.get('title', exam.title)
        description = request.data.get('description', exam.description)
        duration_minutes = request.data.get('duration_minutes', exam.duration_minutes)
        questions_data = request.data.get('questions', [])

        exam.title = title
        exam.description = description
        exam.duration_minutes = duration_minutes
        exam.save()

        if questions_data:
            # Delete old questions and create new ones
            exam.questions.all().delete()
            for q_data in questions_data:
                Question.objects.create(
                    exam=exam,
                    text=q_data.get('text', ''),
                    option_a=q_data.get('option_a', ''),
                    option_b=q_data.get('option_b', ''),
                    option_c=q_data.get('option_c', ''),
                    option_d=q_data.get('option_d', ''),
                    correct_option=q_data.get('correct_option', 'a')
                )

        return Response({'message': 'Exam updated successfully', 'id': exam.id})
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def log_cheating(request):
    exam_id = request.data.get('exam_id')
    action = request.data.get('action')

    try:
        exam = Exam.objects.get(id=exam_id)
        CheatingLog.objects.create(
            student=request.user,
            exam=exam,
            action=action
        )
        return Response({'message': 'Logged successfully'})
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)     

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def cheating_report(request):
    if request.user.profile.role != 'tutor':
        return Response({'error': 'Only tutors can access this'}, status=403)

    my_exams = Exam.objects.filter(created_by=request.user)
    logs = CheatingLog.objects.filter(exam__in=my_exams).order_by('-timestamp')

    data = []
    for log in logs:
        data.append({
            'id': log.id,
            'student': log.student.username,
            'exam': log.exam.title,
            'action': log.action,
            'timestamp': log.timestamp,
        })

    return Response(data)   
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def explain_question(request):
    question_text = request.data.get('question')
    correct_option = request.data.get('correct_option')
    correct_text = request.data.get('correct_text')

    if not question_text:
        return Response({'error': 'Question is required'}, status=400)

    try:
        from groq import Groq
        from django.conf import settings

        client = Groq(api_key=settings.GROQ_API_KEY)

        prompt = f"""Question: {question_text}
Correct Answer: {correct_text}

Give a brief, clear explanation (2-3 sentences) of why this is the correct answer. Be educational and concise."""

        chat = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            max_tokens=200,
            temperature=0.5,
        )

        explanation = chat.choices[0].message.content.strip()
        return Response({'explanation': explanation})

    except Exception as e:
        return Response({'error': str(e)}, status=500) 
       