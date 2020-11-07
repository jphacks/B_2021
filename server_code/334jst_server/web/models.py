from web import db, ma
from marshmallow_sqlalchemy import ModelSchema
from flask import jsonify
import json

class Sound(db.Model):
    __tablename__ = 'sounds'
    id = db.Column(db.Integer, primary_key=True)
    sound_type = db.Column(db.String(64), index=True)
    pitch_name = db.Column(db.String(64), index=True)
    start = db.Column(db.Integer, index=True)
    length = db.Column(db.Integer, index=True)
    room = db.Column(db.String(64), index=True)
    made_by = db.Column(db.String(64), index=True)
    

    def registSound(sound):
        record = Sound(
            sound_type=sound['sound_type'],
            pitch_name=sound['pitch_name'],
            start=sound['start'],
            length=sound['length'],
            room=sound['room'],
            made_by=sound['made_by']
        )

        db.session.add(record)
        db.session.commit()

        return record.id
    
    def removeSound(sound):
        found_entry = Sound.query.filter_by(id=sound['id']).first()
        db.session.delete(found_entry)
        db.session.commit()

        return sound
    
    def __repr__(self):
        return '<Sound id={id} sound_type={sound_type} pitch_name={pitch_name} start={start} length={length} room={room} made_by={made_by}>'.format(id=self.id, sound_type=self.sound_type, pitch_name=self.pitch_name, start=self.start, length=self.length, room=self.room, made_by=self.made_by)

class SoundSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Sound
        load_instance = True

class Room(db.Model):
    __tablename__ = 'rooms'
    name = db.Column(db.String(64), primary_key=True)
    bpm = db.Column(db.Integer, index=True)
    num_of_bar = db.Column(db.Integer, index=True)

    def registRoom(room):
        record = Room(
            name=room['name'],
            bpm=room['bpm'],
            num_of_bar = room['num_of_bar']
        )

        db.session.add(record)
        db.session.commit()

        return record.name
    
    def removeRoom(room):
        found_entry = Room.query.filter_by(name=room['name']).first()
        db.session.delete(found_entry)
        db.session.commit()

        return room
    
    def __repr__(self):
        return '<Room name={name} bpm={bpm} num_of_bar={num_of_bar}>'.format(name=self.name, bpm=self.bpm, num_of_bar=self.num_of_bar)


class RoomSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Room
        load_instance = True