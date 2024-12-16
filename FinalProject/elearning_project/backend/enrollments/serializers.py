from rest_framework import serializers

class CoursePurchaseSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()

    def validate_course_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Invalid course ID.")
        return value