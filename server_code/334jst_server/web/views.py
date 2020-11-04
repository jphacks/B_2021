from web import app, db, ma
from web.models import Sound,SoundSchema,Room,RoomSchema
from flask import render_template, redirect, url_for, request, flash, jsonify
import json

@app.route('/show_all', methods=['GET'])
def show_entries_json():
    sounds = Sound.query.order_by(Sound.id.desc()).all()
    sounds_schema = SoundSchema(many=True)
    return jsonify({'sounds': sounds_schema.dump(sounds)})
  
@app.route('/show_room', methods=['POST'])
def show_room_json():
    
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    try:
      sounds = Sound.query.filter_by(room=userData['room']).all()
      sounds_schema = SoundSchema(many=True)
      return jsonify({'sounds': sounds_schema.dump(sounds)})
    except:
      return jsonify({'code': 400,'error': 'Bad Request. JSON Format may not be true.'})

@app.route('/regist', methods=['POST'])
def registSound_json():
    
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    try:
      id = Sound.registSound(userData)
      return jsonify({'code': 200,'id': id})
    except:
      return jsonify({'code': 403,'error': 'Forbidden'})

@app.route('/remove', methods=['POST'])
def removeSound_json():

    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    try:
      sound = Sound.removeSound(userData)
      return jsonify({'code': 200,'sound': sound})
    except:
      return jsonify({'code': 403,'error': 'Cannot remove.'})

@app.route('/create_room', methods=['POST'])
def registRoom_json():
    
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    try:
      name = Room.registRoom(userData)
      return jsonify({'code': 200,'name': name})
    except:
      return jsonify({'code': 403,'error': 'This room name is already used! You must change!'})

@app.route('/status_room', methods=['POST'])
def statusRoom_json():
    
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    try:
      rooms = Room.query.filter_by(name=userData['name']).all()
      rooms_schema = RoomSchema(many=True)
      return jsonify({'rooms': rooms_schema.dump(rooms)})
    except:
      return jsonify({'code': 400,'error': 'Bad Request. JSON Format may not be true.'})

@app.route('/remove_room', methods=['POST'])
def removeRoom_json():

    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    try:
      room = Room.removeRoom(userData)
      return jsonify({'code': 200,'room': room})
    except:
      return jsonify({'code': 403,'error': 'Cannot remove.'})

