from flask import Flask, jsonify, request
from flask_cors import cross_origin
from services.expenses import export_all_expenses, get_all_days, get_all_expenses, get_all_months, get_all_years, report_month_expenses, update_expenses

app = Flask(__name__)


@app.route('/expenses')
@app.route('/expenses/<year>')
@app.route('/expenses/<year>/<month>')
@app.route('/expenses/<year>/<month>/<day>', methods=['GET', 'POST'])
@cross_origin()
def expense_tracker(year=None, month=None, day=None):
    if request.method == 'GET':
        if (request.args.get('export') == 'true'):
            return jsonify(export_all_expenses())
        if year is None:
            return jsonify(get_all_years())
        if month is None:
            return jsonify(get_all_months(year))
        if day is None:
            if (request.args.get('report') == 'true'):
                return jsonify(report_month_expenses(year, month))
            return jsonify(get_all_days(year, month))
        return jsonify(get_all_expenses(year, month, day))

    if request.method == 'POST':
        try:
            data = request.get_json()
            if isinstance(data, list) and year and month and day:
                return jsonify(update_expenses(data, year, month, day)), 200
            return jsonify({'error': 'Bad Request'}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    return 'Something Went Wrong!'


app.run(host='0.0.0.0', port=5000, debug=True)
