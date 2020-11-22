from web import app, db, ma
from web.models import Sound,SoundSchema,Room,RoomSchema
from flask import render_template, redirect, url_for, request, flash, jsonify
import json
import os
import werkzeug
import base64
from datetime import datetime

UPLOAD_DIR = '/home/kou/334jst/334jst_server/upload'

@app.route('/show_all', methods=['GET'])
def show_entries_json():
    sounds = Sound.query.order_by(Sound.id.desc()).all()
    sounds_schema = SoundSchema(many=True)
    return jsonify({'sounds': sounds_schema.dump(sounds)})
  
@app.route('/show_room', methods=['POST'])
def show_room_json():
    
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    sounds = Sound.query.filter_by(room=userData['room']).all()
    sounds_schema = SoundSchema(many=True)
    return jsonify({'sounds': sounds_schema.dump(sounds)})

@app.route('/regist', methods=['POST'])
def registSound_json():
    
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    id = Sound.registSound(userData)
    return jsonify({'code': 200,'id': id})

    
@app.route('/remove', methods=['POST'])
def removeSound_json():

    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    sound = Sound.removeSound(userData)
    return jsonify({'code': 200,'sound': sound})
  
@app.route('/room_sound_all_remove',methods=['POST'])
def room_removeSound_json():
    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)
    sound = Sound.room_sound_all_remove(userData)
    return jsonify({'code': 200,'sound': sound})

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

    rooms = Room.query.filter_by(name=userData['name']).all()
    rooms_schema = RoomSchema(many=True)
    return jsonify({'rooms': rooms_schema.dump(rooms)})

@app.route('/remove_room', methods=['POST'])
def removeRoom_json():

    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    room = Room.removeRoom(userData)
    return jsonify({'code': 200,'room': room})

@app.route('/change_bpm', methods=['POST'])
def changeBpm_json():

    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    room = Room.changeBpm(userData)
    return jsonify({'code': 200,'room': room})

@app.route('/change_num_of_bar', methods=['POST'])
def changeNumofbar_json():

    jsonData = json.dumps(request.json)
    userData = json.loads(jsonData)

    room = Room.changeNumofbar(userData)
    return jsonify({'code': 200,'room': room})


@app.route('/upload', methods=['POST'])
def upload_wav():
    jsonData = request.json
    fileName = jsonData.get("fileName")
    roomName = jsonData.get("roomName")
    contentDataAscii = jsonData.get("base64Data")

    contentData = base64.b64decode(contentDataAscii)

    UPLOAD_ROOM_DIR = UPLOAD_DIR + '/' + roomName

    if not os.path.exists(UPLOAD_ROOM_DIR):
      os.mkdir(UPLOAD_ROOM_DIR)

    with open(os.path.join(UPLOAD_ROOM_DIR, fileName), 'wb') as saveFile:
        saveFile.write(contentData)
    return jsonify({'fileName':fileName})

@app.route('/upload/<string:roomName>/<string:fileName>', methods=['GET'])
def fileJSON(roomName,fileName):
    sendJSON = {
      'fileName':fileName,
      'roomName':roomName,
    }
    GET_FILEPATH  = UPLOAD_DIR + '/' + roomName + '/' + fileName
    fileDataBinary = open(GET_FILEPATH,'rb').read()
    sendJSON['base64Data'] = base64.b64encode(fileDataBinary)
    return jsonify(sendJSON)

@app.route('/difference_uploaded',methods=['POST'])
def defference_detector():
    jsonData = request.json
    current_list = jsonData.get("current_list")
    roomName = jsonData.get("roomName")

    GET_DIRPATH = UPLOAD_DIR + '/' + roomName
    addData = []

    files = os.listdir(GET_DIRPATH)
    exist_list = [f for f in files if os.path.isfile(os.path.join(GET_DIRPATH, f))]

    remove_list = list(set(current_list) - set(exist_list))

    send_list = list(set(exist_list) - set(current_list))

    for fileName in send_list:
      GET_FILEPATH = GET_DIRPATH + '/' + fileName
      fileDataBinary = open(GET_FILEPATH,'rb').read()
      appendJSON = {
        'fileName':fileName,
        'roomName':roomName,
      }
      appendJSON['base64Data'] = base64.b64encode(fileDataBinary)
      addData.append(appendJSON)

    sendJSON = {
      'remove_list':remove_list,
      'addData':addData
    }

    return jsonify(sendJSON)

@app.route('/upload/<string:roomName>/<string:fileName>', methods=['DELETE'])
def remove(roomName,fileName):
    os.remove(UPLOAD_DIR + '/' + roomName + '/' + fileName)
    returnJSON = {
      'result':'successfully deleted',
      'code':200
    }
    return jsonify(returnJSON)

@app.route('/upload/<string:roomName>/<string:fileName>', methods=['PUT'])
def upload_restfully(roomName,fileName):
    jsonData = request.json
    print(jsonData)
    contentDataAscii = jsonData.get("base64Data")

    contentData = base64.b64decode(contentDataAscii)

    UPLOAD_ROOM_DIR = UPLOAD_DIR + '/' + roomName

    if not os.path.exists(UPLOAD_ROOM_DIR):
      os.mkdir(UPLOAD_ROOM_DIR)

    with open(os.path.join(UPLOAD_ROOM_DIR, fileName), 'wb') as saveFile:
        saveFile.write(contentData)
    return jsonify({'result':'successfully uploaded','code':200})
