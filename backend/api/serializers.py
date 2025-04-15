from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Category, SubCategory, Expense, Income, ChatMessage, OTPVerification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role')
        read_only_fields = ('id', 'role')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        try:
            validate_password(attrs['password'])
        except Exception as e:
            raise serializers.ValidationError({"password": list(e)})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['is_active'] = True  # Set to True for OTP verification instead of email verification
        validated_data['is_email_verified'] = False  # Will be set to True after OTP verification
        
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_image', 'role', 'is_active', 'is_email_verified')
        read_only_fields = ('id', 'email', 'role', 'is_email_verified')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = SubCategory
        fields = ('id', 'category', 'category_name', 'name', 'description', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_category(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("Category does not belong to this user")
        return value

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    subcategory_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = ('id', 'expense_note', 'expense_amount', 'transaction_datetime', 
                  'receiver', 'category', 'category_name', 'subcategory', 
                  'subcategory_name', 'created_at')
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
        
    def get_subcategory_name(self, obj):
        return obj.subcategory.name if obj.subcategory else None
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, attrs):
        if 'category' in attrs and 'subcategory' in attrs and attrs['subcategory']:
            if attrs['subcategory'].category != attrs['category']:
                raise serializers.ValidationError({
                    "subcategory": "Subcategory does not belong to the selected category"
                })
        return attrs
    
    def validate_category(self, value):
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("Category does not belong to this user")
        return value
    
    def validate_subcategory(self, value):
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("Subcategory does not belong to this user")
        return value

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ('id', 'everymonth_payment_date', 'amount', 'description', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_everymonth_payment_date(self, value):
        if value < 1 or value > 31:
            raise serializers.ValidationError("Payment date must be between 1 and 31")
        return value

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ('id', 'role', 'content', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    verification_type = serializers.ChoiceField(
        choices=['registration', 'login', 'password_reset'],
        default='registration'
    )
    
    def validate_email(self, value):
        verification_type = self.initial_data.get('verification_type', 'registration')
        
        # For registration, the email shouldn't exist
        if verification_type == 'registration':
            if User.objects.filter(email=value).exists():
                user = User.objects.get(email=value)
                if user.is_email_verified:
                    raise serializers.ValidationError("Email already registered. Please login instead.")
                # If not verified, we'll allow it to get a new OTP
                return value
        
        # For login/password reset, the email should exist
        elif verification_type in ['login', 'password_reset']:
            if not User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email not registered. Please sign up first.")
        
        return value

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)
    verification_type = serializers.ChoiceField(
        choices=['registration', 'login', 'password_reset'],
        default='registration'
    )

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, required=True)
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        
        try:
            validate_password(attrs['new_password'])
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e)})
        
        return attrs 

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New password fields didn't match."})
        
        try:
            validate_password(attrs['new_password'])
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e)})
        
        return attrs 