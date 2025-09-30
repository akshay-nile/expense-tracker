import sqlite3
from typing import Dict, List

_conn: sqlite3.Connection | None = None


def get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect('storage/expenses.db', check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            timestamp   INTEGER     PRIMARY KEY,
            date        TEXT        NOT NULL,
            purpose     TEXT        NOT NULL,
            amount      INTEGER     NOT NULL
        );
        ''')
        _conn.commit()
    return _conn


def get_all_years() -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT 
            STRFTIME('%Y', date) AS year,
            SUM(amount) AS total
        FROM expenses
        GROUP BY year
        ORDER BY year;
    ''')
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def get_all_months(year: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT 
            STRFTIME('%m', date) AS month, 
            SUM(amount) AS total
        FROM expenses
        WHERE STRFTIME('%Y', date) = ?
        GROUP BY month
        ORDER BY month;
    ''', (year,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def get_all_days(year: str, month: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT 
            STRFTIME('%d', date) AS day,
            SUM(amount) AS total
        FROM expenses
        WHERE STRFTIME('%Y', date) = ? AND STRFTIME('%m', date) = ?
        GROUP BY day
        ORDER BY day;
    ''', (year, month))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def get_all_expenses(year: str, month: str, day: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT timestamp, purpose, amount
        FROM expenses
        WHERE 
            STRFTIME('%Y', date) = ? AND 
            STRFTIME('%m', date) = ? AND 
            STRFTIME('%d', date) = ?
        ORDER BY timestamp;
    ''', (year, month, day))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def export_all_expenses() -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT
            date, 
            GROUP_CONCAT(purpose, ', ') AS purpose, 
            SUM(amount) AS total
        FROM expenses
        GROUP BY date
        ORDER BY date DESC;
    ''')
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def report_month_expenses(year: str, month: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT 
            STRFTIME('%d', date) AS day,
            GROUP_CONCAT(purpose, ', ') AS purpose,
            SUM(amount) AS total
        FROM expenses
        WHERE STRFTIME('%Y', date) = ? AND STRFTIME('%m', date) = ?
        GROUP BY day
        ORDER BY day;
    ''', (year, month))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def report_year_expenses(year: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT
            month,
            GROUP_CONCAT(purpose, ', ') AS purpose,
            SUM(total) AS total
        FROM (
            SELECT
                STRFTIME('%m', date) AS month,
                purpose,
                SUM(amount) AS total
            FROM expenses
            WHERE STRFTIME('%Y', date) = ?
            GROUP BY month, purpose
            ORDER BY amount DESC
        ) AS monthly
        GROUP BY month
        ORDER BY month;
    ''', (year,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def search_for_expenses(search: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT date, purpose, amount
        FROM expenses
        WHERE LOWER(purpose) LIKE '%' || LOWER(?) || '%'
        ORDER BY date DESC;
    ''', (search,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def update_expenses(expenses: List[Dict], year: str, month: str, day: str) -> Dict[str, int]:
    conn = get_conn()
    cursor = conn.cursor()

    old_timestamps = tuple(map(lambda row: row['timestamp'], get_all_expenses(year, month, day)))
    new_timestamps = tuple(map(lambda row: row['timestamp'], expenses))

    date = f'{year}-{month}-{day}'
    inserted, updated, deleted = max(len(new_timestamps), len(old_timestamps)), 0, 0

    for old_timestamp in old_timestamps:
        if old_timestamp not in new_timestamps:
            cursor.execute('DELETE FROM expenses WHERE timestamp = ?', (old_timestamp,))
            deleted += 1
        else:
            updated += 1
    inserted -= (updated + deleted)

    for expense in expenses:
        expense['date'] = date
        cursor.execute('''
            INSERT INTO expenses (timestamp, date, purpose, amount)
            VALUES (:timestamp, :date, :purpose, :amount)
            ON CONFLICT(timestamp) DO UPDATE SET
                date    = excluded.date,
                purpose = excluded.purpose,
                amount  = excluded.amount;
        ''', expense)

    conn.commit()
    return {'inserted': inserted, 'updated': updated, 'deleted': deleted}
