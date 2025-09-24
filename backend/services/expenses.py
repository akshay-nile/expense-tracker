import sqlite3
from typing import Dict, List

_conn: sqlite3.Connection | None = None


def get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect('database/expenses.db', check_same_thread=False)
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
    return [{'year': row['year'], 'total': row['total']} for row in rows]


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
    return [{'month': row['month'], 'total': row['total']} for row in rows]


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
    return [{'day': row['day'], 'total': row['total']} for row in rows]


def get_all_expenses(year: str, month: str, day: str) -> List[Dict]:
    cursor = get_conn().cursor()
    cursor.execute('''
        SELECT timestamp, purpose, amount
        FROM expenses
        WHERE STRFTIME('%Y', date) = ? AND STRFTIME('%m', date) = ? AND STRFTIME('%d', date) = ?
        ORDER BY timestamp;
    ''', (year, month, day))
    rows = cursor.fetchall()
    return [{'timestamp': row['timestamp'], 'purpose': row['purpose'], 'amount': row['amount']} for row in rows]


def add_or_update_expenses(expenses: List[Dict]) -> Dict[str, int]:
    conn = get_conn()
    cursor = conn.cursor()

    inserted = 0
    updated = 0

    for expense in expenses:
        exists = cursor.execute(
            'SELECT 1 FROM expenses WHERE timestamp = ?',
            (expense.get('timestamp'),)
        ).fetchone() is not None

        cursor.execute('''
            INSERT INTO expenses (timestamp, date, purpose, amount)
            VALUES (:timestamp, :date, :purpose, :amount)
            ON CONFLICT(timestamp) DO UPDATE SET
                date    = excluded.date,
                purpose = excluded.purpose,
                amount  = excluded.amount;
        ''', expense)

        if exists:
            updated += 1
        else:
            inserted += 1

    conn.commit()
    return {'inserted': inserted, 'updated': updated}


# get_conn().executescript('''
# INSERT INTO expenses (timestamp, date, purpose, amount) VALUES
# (1722417000000,'2025-07-01','miscellaneous',30),
# (1722503400000,'2025-07-02','maintenance',580),
# (1722589800000,'2025-07-03','jio airfiber',710),
# (1722676200000,'2025-07-04','jio recharge',420),
# (1722762600001,'2025-07-05','kirana',390),
# (1722762600002,'2025-07-05','miscellaneous',390),
# (1722935400000,'2025-07-07','miscellaneous',60),
# (1723194600000,'2025-07-09','miscellaneous',90),
# (1723281000000,'2025-07-10','miscellaneous',80),
# (1723367400001,'2025-07-11','haircut',400),
# (1723367400002,'2025-07-11','non veg',400),
# (1723453800000,'2025-07-12','medicines',1320),
# (1723540200000,'2025-07-13','achalpur bus',390),
# (1723713000000,'2025-07-15','wardha bus',440),
# (1723799400001,'2025-07-16','petrol',300),
# (1723799400002,'2025-07-16','birthday',300),
# (1723885800000,'2025-07-17','miscellaneous',90),
# (1723972200000,'2025-07-18','miscellaneous',270),
# (1724058600000,'2025-07-19','jio recharge',190),
# (1724145000001,'2025-07-20','electric bill',430),
# (1724145000002,'2025-07-20','miscellaneous',430),
# (1724231400000,'2025-07-21','baby belt',430),
# (1724404200000,'2025-07-23','miscellaneous',30),
# (1724490600000,'2025-07-24','miscellaneous',90),
# (1724663400000,'2025-07-26','miscellaneous',30),
# (1724750000000,'2025-07-27','miscellaneous',140),
# (1724922600000,'2025-07-29','anda curry',320),
# (1725009000000,'2025-07-30','miscellaneous',150),

# (1725084600001,'2025-08-01','jio recharge',280),
# (1725084600002,'2025-08-01','miscellaneous',280),
# (1725171000000,'2025-08-02','maintenance',570),
# (1725257400000,'2025-08-03','kirana',640),
# (1725343800000,'2025-08-04','jio airfiber',830),
# (1725430200000,'2025-08-05','kirana',520),
# (1725603000000,'2025-08-07','miscellaneous',120),
# (1725689400000,'2025-08-08','miscellaneous',130),
# (1725862200000,'2025-08-10','miscellaneous',80),
# (1725948600000,'2025-08-11','good night',500),
# (1726035000001,'2025-08-12','petrol',345),
# (1726035000002,'2025-08-12','miscellaneous',345),
# (1726121400001,'2025-08-13','dettol',173),
# (1726121400002,'2025-08-13','diapers',173),
# (1726207800001,'2025-08-14','hooks',110),
# (1726207800002,'2025-08-14','cake',110),
# (1726207800003,'2025-08-14','miscellaneous',110),
# (1726294200000,'2025-08-15','miscellaneous',20),
# (1726380600001,'2025-08-16','palana',690),
# (1726380600002,'2025-08-16','blouse',690),
# (1726467000001,'2025-08-17','jio rechg',415),
# (1726467000002,'2025-08-17','chappal',415),
# (1726640000000,'2025-08-19','miscellaneous',30),
# (1726726400001,'2025-08-20','electric bill',390),
# (1726726400002,'2025-08-20','miscellaneous',390),
# (1726812800000,'2025-08-21','miscellaneous',150),
# (1726899200001,'2025-08-22','shelcal',130),
# (1726899200002,'2025-08-22','miscellaneous',130),
# (1726985600001,'2025-08-23','kirana',240),
# (1726985600002,'2025-08-23','miscellaneous',240),
# (1727072000001,'2025-08-24','drops',447),
# (1727072000002,'2025-08-24','kirana',447),
# (1727072000003,'2025-08-24','miscellaneous',446),
# (1727158400001,'2025-08-25','ghutty',197),
# (1727158400002,'2025-08-25','fruits',197),
# (1727158400003,'2025-08-25','miscellaneous',196),
# (1727244800000,'2025-08-26','miscellaneous',30),
# (1727331200001,'2025-08-27','ele bill tiosa',1025),
# (1727331200002,'2025-08-27','miscellaneous',1025),
# (1727417600000,'2025-08-28','jio recharge',190),
# (1727504000000,'2025-08-29','miscellaneous',330),

# (1727590400000,'2025-09-01','miscellaneous',110),
# (1727676800000,'2025-09-02','maintenance',690),
# (1727763200001,'2025-09-03','teether',193),
# (1727763200002,'2025-09-03','kirana',192),
# (1727763200003,'2025-09-03','cal',192),
# (1727763200004,'2025-09-03','miscellaneous',193),
# (1727936000000,'2025-09-05','miscellaneous',220),
# (1728022400001,'2025-09-06','kirana',227),
# (1728022400002,'2025-09-06','thyronorm',226),
# (1728022400003,'2025-09-06','miscellaneous',227),
# (1728108800001,'2025-09-07','airfiber',1480),
# (1728108800002,'2025-09-07','airtel rechg',1480),
# (1728195200000,'2025-09-08','baby shirts',350),
# (1728281600000,'2025-09-09','nasta',220),
# (1728368000000,'2025-09-10','miscellaneous',100),
# (1728454400000,'2025-09-11','miscellaneous',30),
# (1728540800000,'2025-09-12','kirana',1000),
# (1728627200000,'2025-09-13','miscellaneous',70),
# (1728713600001,'2025-09-14','shelcal',360),
# (1728713600002,'2025-09-14','miscellaneous',360),
# (1728800000000,'2025-09-15','jio recharge',190),
# (1728886400001,'2025-09-16','cylinder',515),
# (1728886400002,'2025-09-16','miscellaneous',515);
# ''')
