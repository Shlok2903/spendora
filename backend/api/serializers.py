from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Category, SubCategory, Expense, Income, ChatMessage

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password', 'password2', 'role')
        extra_kwargs = {
            'role': {'read_only': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')  # Remove password2 field
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active')
        read_only_fields = ('email', 'role')

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