# users/services.py

from ..serializers.users_serializers import UserRegistrationSerializer

def create_user(user_data: dict) -> dict:
    """
    Service function to handle user creation.
    1. Validates incoming data.
    2. Creates the user if valid.
    3. Returns the created user data or raises an error.
    """
    serializer = UserRegistrationSerializer(data=user_data)
    # The raise_exception=True will automatically return a 400 Bad Request
    # with validation errors if the data is bad.
    serializer.is_valid(raise_exception=True)

    # .save() will now call the serializer's .create() method
    user = serializer.save()

    return serializer.data