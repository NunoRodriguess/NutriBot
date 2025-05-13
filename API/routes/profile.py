from flask import Blueprint, request, jsonify
from enum import Enum
from mongo_connector import MongoDBConnection

class CategorieEnum(str, Enum):
    NEVER = "never"
    RARELY = "rarely"
    OCCASIONALLY = "occasionally"
    OFTEN = "often"
    DAILY = "daily"

profile_bp = Blueprint('profile', __name__)
mdb_conn = MongoDBConnection()  

@profile_bp.route('/profile/<username>', methods=['GET'])
def get_profile(username):
    try:
        user_info = mdb_conn.get_user_info(str(username))
        return jsonify(user_info), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404

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

    try:
        user_info = mdb_conn.create_user(username, email)
        return jsonify({'message': 'Profile created successfully', 'data': user_info}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    fields = [
        data.get('age'),
        data.get('weight'),
        data.get('height'),
        data.get('icm'),
        data.get('sex'),
        data.get('body_fat'),
        data.get('avg_working_hours'),
        data.get('avg_sleep_hours'),
        data.get('physical_activity'),
        data.get('smoking'),
        data.get('alcohol_consumption'),
        data.get('diseases'),
        data.get('medications'),
        data.get('allergies'),
        data.get('diet'),
        data.get('other')
    ]

    has_at_least_one_non_null = any(field is not None for field in fields)

    if not has_at_least_one_non_null:
        return jsonify({'error': 'At least one field must be non-null'}), 400
    
    structured_fields = {}

    if data.get('age') is not None:
        if not isinstance(data['age'], int):
            return jsonify({'error': 'Invalid type for age'}), 400
        structured_fields['age'] = data['age']

    if data.get('weight') is not None:
        if not isinstance(data['weight'], (int, float)):
            return jsonify({'error': 'Invalid type for weight'}), 400
        structured_fields['weight'] = data['weight']

    if data.get('height') is not None:
        if not isinstance(data['height'], (int, float)):
            return jsonify({'error': 'Invalid type for height'}), 400
        structured_fields['height'] = data['height']

    if data.get('icm') is not None:
        if not isinstance(data['icm'], (int, float)):
            return jsonify({'error': 'Invalid type for icm'}), 400
        structured_fields['icm'] = data['icm']

    if data.get('sex') is not None:
        if not isinstance(data['sex'], str):
            return jsonify({'error': 'Invalid type for sex'}), 400
        structured_fields['sex'] = data['sex']

    if data.get('body_fat') is not None:
        if not isinstance(data['body_fat'], (int, float)):
            return jsonify({'error': 'Invalid type for body_fat'}), 400
        structured_fields['body_fat'] = data['body_fat']

    if data.get('avg_working_hours') is not None:
        if not isinstance(data['avg_working_hours'], (int, float)):
            return jsonify({'error': 'Invalid type for avg_working_hours'}), 400
        structured_fields['avg_working_hours'] = data['avg_working_hours']

    if data.get('avg_sleep_hours') is not None:
        if not isinstance(data['avg_sleep_hours'], (int, float)):
            return jsonify({'error': 'Invalid type for avg_sleep_hours'}), 400
        structured_fields['avg_sleep_hours'] = data['avg_sleep_hours']

    if data.get('physical_activity') is not None:
        if data['physical_activity'] not in CategorieEnum.__members__.values():
            return jsonify({'error': 'Invalid value for physical_activity'}), 400
        structured_fields['physical_activity'] = data['physical_activity']

    if data.get('smoking') is not None:
        if data['smoking'] not in CategorieEnum.__members__.values():
            return jsonify({'error': 'Invalid value for smoking'}), 400
        structured_fields['smoking'] = data['smoking']

    if data.get('alcohol_consumption') is not None:
        if data['alcohol_consumption'] not in CategorieEnum.__members__.values():
            return jsonify({'error': 'Invalid value for alcohol_consumption'}), 400
        structured_fields['alcohol_consumption'] = data['alcohol_consumption']

    if data.get('diseases') is not None:
        if not isinstance(data['diseases'], list) or not all(isinstance(disease, str) for disease in data['diseases']):
            return jsonify({'error': 'Invalid type for diseases'}), 400
        structured_fields['diseases'] = data['diseases']

    if data.get('medications') is not None:
        if not isinstance(data['medications'], list) or not all(isinstance(medication, str) for medication in data['medications']):
            return jsonify({'error': 'Invalid type for medications'}), 400
        structured_fields['medications'] = data['medications']

    if data.get('allergies') is not None:
        if not isinstance(data['allergies'], list) or not all(isinstance(allergy, str) for allergy in data['allergies']):
            return jsonify({'error': 'Invalid type for allergies'}), 400
        structured_fields['allergies'] = data['allergies']

    if data.get('diet') is not None:
        if not isinstance(data['diet'], list) or not all(isinstance(diet, str) for diet in data['diet']):
            return jsonify({'error': 'Invalid type for diet'}), 400
        structured_fields['diet'] = data['diet']

    if data.get('other') is not None:
        if not isinstance(data['other'], str):
            return jsonify({'error': 'Invalid type for other'}), 400
        structured_fields['other'] = data['other']

    try:
        updated_profile = mdb_conn.update_profile(username, structured_fields)
        return jsonify({'message': 'Profile updated successfully', 'data': updated_profile}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
@profile_bp.route('/profile/<username>', methods=['DELETE'])
def delete_profile(username):
    try:
        result = mdb_conn.delete_user(username)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404