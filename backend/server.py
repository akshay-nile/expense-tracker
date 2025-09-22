from flask import Flask, jsonify, request
from flask_cors import cross_origin
from services.expenses import add_or_update_expenses, get_all_days, get_all_expenses, get_all_months, get_all_years

app = Flask(__name__)


@app.route('/expenses', methods=['GET', 'POST'])
@app.route('/expenses/<year>')
@app.route('/expenses/<year>/<month>')
@app.route('/expenses/<year>/<month>/<day>')
@cross_origin()
def expense_tracker(year=None, month=None, day=None):
    if request.method == 'GET':
        if year is None:
            return jsonify(get_all_years())
        if month is None:
            return jsonify(get_all_months(year))
        if day is None:
            return jsonify(get_all_days(year, month))
        return jsonify(get_all_expenses(year, month, day))

    if request.method == 'POST':
        try:
            data = request.get_json()
            if isinstance(data, list):
                status = add_or_update_expenses(data)
                return jsonify(status), (201 if status['inserted'] > 0 else 200)
            return jsonify({'error': 'Bad Request', 'description': 'invalid request body'}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    return 'Something Went Wrong!'


app.run(host='0.0.0.0', port=5000, debug=True)
