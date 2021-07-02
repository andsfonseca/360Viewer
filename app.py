from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

RESOURCES_FOLDER = "./Resources/"
EQUIRECTANGULAR_FOLDER = RESOURCES_FOLDER + "Equiretangular/"
MODELS_FOLDER = RESOURCES_FOLDER + "Modelos/"

EquirectangularJSON = None;
ModelsJSON = None;

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/getEquirectangular')
def getEquirectangular():
    global EquirectangularJSON;

    if(not EquirectangularJSON):
        allFiles = os.listdir(EQUIRECTANGULAR_FOLDER)
    
        folders = list(filter(lambda path : os.path.isdir(EQUIRECTANGULAR_FOLDER + path), allFiles))

        folderAssets = []

        for folder in folders:
            folderFiles = os.listdir(EQUIRECTANGULAR_FOLDER + folder)
            files = list(filter(lambda file : file.endswith(".JPG"), folderFiles))

            if(files):
                folderAssets.append({"label" : folder, "files" : files})
        
        EquirectangularJSON = jsonify({"folders" : folderAssets})
    return EquirectangularJSON

@app.route('/getEquirectangularImage/<path>/<file>', methods=['GET'])
def getEquirectangularImage(path, file):
    return send_from_directory(EQUIRECTANGULAR_FOLDER + path, file)

@app.route('/getModel/<path>/<file>', methods=['GET'])
def getModel(path, file):
    return send_from_directory(MODELS_FOLDER + path, file)

@app.route('/getMTL/<path>/<file>', methods=['GET'])
def getMTL(path, file):
    return send_from_directory(MODELS_FOLDER + path, os.path.splitext(file)[0] + ".mtl", )

@app.route('/getModels')
def getModels():
    global ModelsJSON;

    if(not ModelsJSON):
        allFiles = os.listdir(MODELS_FOLDER)
    
        folders = list(filter(lambda path : os.path.isdir(MODELS_FOLDER + path), allFiles))

        folderAssets = []

        for folder in folders:
            folderFiles = os.listdir(MODELS_FOLDER + folder)

            files = []

            for file in folderFiles:
                if(file.endswith(".glb") and not file.endswith("_uncompressed.glb")):
                    files.append(file)

            if(files):
                folderAssets.append({"label" : folder, "files" : list(map(lambda file: {"file": file, "size": round(os.path.getsize(MODELS_FOLDER + folder + "/" + file)/(1024*1024),2)}, files))})
        
        ModelsJSON = jsonify({"folders" : folderAssets})
    return ModelsJSON