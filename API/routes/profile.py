from flask import Blueprint, request, jsonify

profile_bp = Blueprint('profile', __name__)

# Get all profile data from a user, having his username
@profile_bp.route('/profile/<username>', methods=['GET'])
def get_profile(username):
    # TODO: Implement the logic to retrieve the profile data for the given username
    # For now, we will return nothing
    return None, 200

@profile_bp.route('/profile', methods=['POST'])
def create_profile():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')

    fields = [email, username]
    has_at_least_one_non_null = any(field is not None for field in fields)

    if not has_at_least_one_non_null:
        return jsonify({'error': 'At least one field must be non-null'}), 400

    if email is not None and not isinstance(email, str):
        return jsonify({'error': 'Invalid type for email'}), 400
    
    if username is not None and not isinstance(username, str):
        return jsonify({'error': 'Invalid type for username'}), 400

    return jsonify({'message': 'Profile data received successfully', 'data': data}), 200

@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    username = data.get('username')
    fields = [
        data.get('age'),
        data.get('weight'),
        data.get('height'),
        data.get('bmi'),
        data.get('sex'),
        data.get('bodyFat'),
        data.get('workHours'),
        data.get('sleepHours'),
        data.get('other'),
        data.get('physicalActivity'),
        data.get('alcoholConsumption'),
        data.get('drugUse'),
        data.get('smoking'),
        data.get('diseases'),
        data.get('medications'),
        data.get('allergies'),
    ]

    has_at_least_one_non_null = any(field is not None for field in fields)

    if not has_at_least_one_non_null:
        return jsonify({'error': 'At least one field must be non-null'}), 400

    if data.get('age') is not None and not isinstance(data['age'], int):
        return jsonify({'error': 'Invalid type for age'}), 400
    if data.get('weight') is not None and not isinstance(data['weight'], (int, float)):
        return jsonify({'error': 'Invalid type for weight'}), 400
    if data.get('height') is not None and not isinstance(data['height'], (int, float)):
        return jsonify({'error': 'Invalid type for height'}), 400
    if data.get('bmi') is not None and not isinstance(data['bmi'], (int, float)):
        return jsonify({'error': 'Invalid type for BMI'}), 400
    if data.get('sex') is not None and not isinstance(data['sex'], str):
        return jsonify({'error': 'Invalid type for sex'}), 400
    if data.get('bodyFat') is not None and not isinstance(data['bodyFat'], (int, float)):
        return jsonify({'error': 'Invalid type for bodyFat'}), 400
    if data.get('workHours') is not None and not isinstance(data['workHours'], (int, float)):
        return jsonify({'error': 'Invalid type for workHours'}), 400
    if data.get('sleepHours') is not None and not isinstance(data['sleepHours'], (int, float)):
        return jsonify({'error': 'Invalid type for sleepHours'}), 400
    if data.get('other') is not None and not isinstance(data['other'], str):
        return jsonify({'error': 'Invalid type for other'}), 400
    if data.get('physicalActivity') is not None and not isinstance(data['physicalActivity'], str):
        return jsonify({'error': 'Invalid type for physicalActivity'}), 400
    if data.get('alcoholConsumption') is not None and not isinstance(data['alcoholConsumption'], str):
        return jsonify({'error': 'Invalid type for alcoholConsumption'}), 400
    if data.get('drugUse') is not None and not isinstance(data['drugUse'], str):
        return jsonify({'error': 'Invalid type for drugUse'}), 400
    if data.get('smoking') is not None and not isinstance(data['smoking'], str):
        return jsonify({'error': 'Invalid type for smoking'}), 400
    if data.get('diseases') is not None and not isinstance(data['diseases'], list):
        return jsonify({'error': 'Invalid type for diseases'}), 400
    if data.get('medications') is not None and not isinstance(data['medications'], list):
        return jsonify({'error': 'Invalid type for medications'}), 400
    if data.get('allergies') is not None and not isinstance(data['allergies'], list):
        return jsonify({'error': 'Invalid type for allergies'}), 400

    # TODO: Implement the logic to update the profile data, having the username
    return jsonify({'message': 'Profile data received successfully', 'data': data}), 200
