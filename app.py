from flask import Flask, request, abort, jsonify
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests
import json
import sqlite3
import os

app = Flask(__name__)

def init_db():
    with sqlite3.connect("search_history.db") as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS SearchHistory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS CachedStockData (
            ticker TEXT PRIMARY KEY,
            company_json TEXT,
            stock_json TEXT,
            last_updated DATETIME
        )''')

# init db
init_db()

# grab API key
load_dotenv("secrets.env")
API_KEY = os.getenv("TIINGO_API_KEY")

# method for getting db connection
def get_db():
    conn = sqlite3.connect("search_history.db")
    conn.row_factory = sqlite3.Row
    return conn

# validate ticker
# check cache
# fetch json & format
# store & cache
# send data back to script.js
@app.route("/search")
def searchStocks():
    symbol = request.args.get("ticker")
    symbol = symbol.upper()

    if not symbol or symbol.strip() == "":
        return jsonify({"error": "Invalid ticker"}), 400

    conn = get_db()

    row = conn.execute('''SELECT *
                          FROM CachedStockData
                          WHERE ticker = (?)''', (symbol,)).fetchone()
    if row is not None:
        last_updated = datetime.fromisoformat(row["last_updated"])
        if datetime.utcnow() - last_updated < timedelta(minutes=15):
            conn.close()
            return jsonify({
                "company": json.loads(row["company_json"]),
                "stock": json.loads(row["stock_json"])
            })

    outlook_raw = requests.get(f"https://api.tiingo.com/tiingo/daily/{symbol}?token={API_KEY}").json()
    summary_raw = requests.get(f"https://api.tiingo.com/iex/{symbol}?token={API_KEY}").json()

    if "detail" in outlook_raw or "detail" in summary_raw:
        return jsonify({"error": "Ticker not found"}), 404

    formatted = formatJSON(outlook_raw, summary_raw)

    # insert into search history & cache results
    conn.execute("INSERT INTO SearchHistory (ticker) VALUES (?)", (symbol,))
    conn.execute("INSERT INTO CachedStockData (ticker, company_json, stock_json, last_updated) VALUES (?, ?, ?, ?)",
                 (symbol,
                            json.dumps(formatted["company"]),
                            json.dumps(formatted["stock"]),
                            datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

    return jsonify(formatted)


@app.route("/history", methods=["GET"])
def getSearchHistory():
    conn = get_db()
    history = conn.execute('''SELECT *
                    FROM SearchHistory
                    ORDER BY timestamp DESC
                    LIMIT 10''').fetchall()
    conn.close()
    return jsonify([dict(record) for record in history])


def formatJSON(company_json, stock_json):
    return {
        "company": {
            "name": company_json.get("name"),
            "ticker": company_json.get("ticker"),
            "exchangeCode": company_json.get("exchangeCode"),
            "startDate": company_json.get("startDate"),
            "description": company_json.get("description")
        },
        "stock": {
            "ticker": stock_json.get("ticker"),
            "timestamp": stock_json.get("timestamp"),
            "prevClose": stock_json.get("prevClose"),
            "open": stock_json.get("open"),
            "high": stock_json.get("high"),
            "low": stock_json.get("low"),
            "last": stock_json.get("last"),
            "tngoLast": stock_json.get("tngoLast"),
            "volume": stock_json.get("volume")
        }
    }

if __name__ == "__main__":
    app.run(debug=True)
