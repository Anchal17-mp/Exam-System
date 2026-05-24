from django.urls import path
from . import views

urlpatterns = [
    path('exams/', views.ExamListView.as_view(), name='exam-list'),
    path('exams/<int:pk>/', views.ExamDetailView.as_view(), name='exam-detail'),
    path('my-exams/', views.my_exams, name='my-exams'),
    path('create-exam/', views.create_exam, name='create-exam'),
    path('exams/<int:pk>/edit/', views.edit_exam, name='edit-exam'),
    path('exams/<int:pk>/delete/', views.delete_exam, name='delete-exam'),
    path('submit/', views.submit_exam, name='submit-exam'),
    path('results/', views.my_results, name='my-results'),
    path('tutor-results/', views.tutor_results, name='tutor-results'),
    path('tutors-report/', views.tutors_report, name='tutors-report'),
    path('generate-questions/', views.generate_questions, name='generate-questions'),
    path('log-cheating/', views.log_cheating, name='log-cheating'),
    path('cheating-report/', views.cheating_report, name='cheating-report'),
    path('explain-question/', views.explain_question, name='explain-question'),


]