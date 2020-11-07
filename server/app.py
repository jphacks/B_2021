from flask import Flask, request, jsonify, make_response
import os
app = Flask(__name__)

@app.route('/')
def index():
    #デバッグ用
    return 'Hello World!'

@app.route("/postdata", methods=['POST'])
def postdata():
    # ボディ(application/json)パラメータ
    params = request.json
    response = {}
    if 'param' in params:
        response.setdefault('res', 'param is : ' + params.get('param'))
    return make_response(jsonify(response))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))