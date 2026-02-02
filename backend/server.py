from services.expenses import export_all_expenses, get_all_days, get_all_expenses, get_all_months, get_all_years, report_month_categories, report_month_expenses, report_year_categories, report_year_expenses, update_expenses, search_for_expenses

from flask import Flask, jsonify, request
from flask_cors import cross_origin

app = Flask(__name__)


@app.route('/expenses')
@app.route('/expenses/<year>')
@app.route('/expenses/<year>/<month>')
@app.route('/expenses/<year>/<month>/<day>', methods=['GET', 'POST'])
@cross_origin()
def expense_tracker(year=None, month=None, day=None):
    if request.method == 'GET':
        search = request.args.get('search')
        if search:
            return jsonify(search_for_expenses(search))
        if request.args.get('export') == 'true':
            return jsonify(export_all_expenses())
        if year is None:
            return jsonify(get_all_years())
        if month is None:
            if request.args.get('report') == 'true':
                return jsonify(report_year_expenses(year))
            if request.args.get('categories') == 'true':
                return jsonify(report_year_categories(year))
            return jsonify(get_all_months(year))
        if day is None:
            if request.args.get('report') == 'true':
                return jsonify(report_month_expenses(year, month))
            if request.args.get('categories') == 'true':
                return jsonify(report_month_categories(year, month))
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
