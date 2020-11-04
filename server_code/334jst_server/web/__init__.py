from flask import Flask
from config import DevelopmentConfig
from database import init_db
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import *
from flask_marshmallow import Marshmallow
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object(DevelopmentConfig)
init_db(app)
db = SQLAlchemy(app)
Migrate(app, db)
ma = Marshmallow(app)       

from web import views