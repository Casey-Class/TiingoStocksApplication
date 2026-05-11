from flask import Flask, request, abort
from datetime import datetime, timedelta
import json
import sqlite3

app = Flask(__name__)

def init_db():
    with sqlite3.connect("search_history.db") as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS SearchHistory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.execute('''CREATE TABLE CachedStockData (
            ticker TEXT PRIMARY KEY,
            company_json TEXT,
            stock_json TEXT,
            last_updated DATETIME
        )''')

init_db()

def get_db():
    return sqlite3.connect("search_history.db")


@app.route("/search")
def searchStocks():
    symbol = request.args.get("ticker")
    pass


@app.route("/history", method=["GET"])
def getSearchHistory():
    pass


@app.route("/history", method=["POST"])
def addSearch():
    pass


def formatJSON(company_json, stock_json):
    pass


def validateResult(api_json):
    pass


def cacheResults(ticker, company_json, stock_json):
    pass



