from rest_framework import serializers
from .models import Quiz, QuizQuestion

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']
        read_only_fields = ['quiz']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'title', 'total_marks', 'questions']
        read_only_fields = ['course', 'questions']

class QuizAttemptSerializer(serializers.Serializer):
    quiz_id = serializers.IntegerField()
    answers = serializers.DictField(
        child=serializers.CharField(max_length=1)
    )

    def validate_quiz_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Invalid quiz_id.")
        return value