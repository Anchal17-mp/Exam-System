
# Register your models here.
from django.contrib import admin
from .models import Exam, Question, Result,CheatingLog

admin.site.register(Exam)
admin.site.register(Question)
admin.site.register(Result)
admin.site.register(CheatingLog)
