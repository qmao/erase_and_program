import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from pathlib import Path

import logging

import os

import tornado
import uuid
from werkzeug.utils import secure_filename
import grp, pwd
import glob
import re

import sys
sys.path.append("/usr/local/syna/lib/python")
from touchcomm import TouchComm
from programmer import AsicProgrammer

import shutil

packrat_cache = "/var/cache/syna/packrat"
workspace = '/home/pi/jupyter/workspace'
workspacke_cache = workspace + '/packrat' + '/hex'

def UpdateHexLink():
    if os.path.exists(workspacke_cache):
        try:
            shutil.rmtree(workspacke_cache)
        except OSError as e:
            print("Error: %s - %s." % (e.filename, e.strerror))

    os.makedirs(workspacke_cache)

    for packrat in os.listdir(packrat_cache):
        print(packrat)
        dirpath = packrat_cache + '/' + packrat
        for fname in os.listdir(dirpath):
            if fname.endswith('.hex'):
                print(dirpath)
                os.symlink(dirpath, workspacke_cache + '/' + packrat)
                break

def UpdateWorkspakce():
    UpdateHexLink()

def GetFileList(extension, packrat=""):

    UpdateWorkspakce()

    filelist = []
    os.chdir(packrat_cache)
    for file in glob.glob("**/*." + extension):
        print(file)
        filelist += [str(file)]

    data = json.loads("{}")
    data["filelist"] = filelist
    data["upload"] = packrat

    jsonString = json.dumps(data)
    return jsonString

def GetSymbolValue(symbol, content):
    find=r'(?<='+ symbol + r'=").*(?=")'
    x = re.findall(find, content)

    if (len(x) > 0):
        return x[0]
    else:
        return None
    

class ProgramHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /erase-and-program/get_example endpoint!"
        }))
        
    @tornado.web.authenticated
    def post(self):
        # input_data is a dictionary with a key "filename"
        input_data = self.get_json_body()
        print(input_data)

        print("start to erase and program!!!")
        ####PR3319382.hex
        
        filename = os.path.join(packrat_cache, input_data["filename"])
        print(filename)

        if not os.path.isfile(filename):
            raise Exception(filename)

        AsicProgrammer.programHexFile(filename, communication='socket', server='127.0.0.1')
        print("Erase and program done!!!")
        
        tc = TouchComm.make(protocols='report_streamer', server='127.0.0.1')
        if(tc):
            id = tc.identify()
            print(id)
            tc.close()
            tc = None

        data = id
        self.finish(json.dumps(data))


class UploadHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        print(self.request)
        self.finish(json.dumps({
            "data": "file is created la!"
        }))  


    @tornado.web.authenticated
    def post(self):
        print(self.request)

        for field_name, files in self.request.files.items():
            print(field_name)
            for f in files:
                filename, content_type = f["filename"], f["content_type"]
                body = f["body"]
                logging.info(
                    'POST "%s" "%s" %d bytes', filename, content_type, len(body)
                )
                print(filename)
                print(content_type)

                ## save file
                ## img_path = os.path.join(save_father_path, str(uuid.uuid1()) + '.' + secure_filename(f.filename).split('.')[-1])

                packrat_id = GetSymbolValue("PACKRAT_ID", body.decode('utf-8'))
                print(packrat_id)

                path = os.path.join(packrat_cache, packrat_id)
                Path(path).mkdir(parents=True, exist_ok=True)

                packrat_filename="PR" + packrat_id + ".hex"

                file_path = os.path.join(path, packrat_filename)
                print(file_path)

                with open(file_path, 'wb') as f:
                    f.write(body)

                data = GetFileList('hex', packrat_filename)

                print(data)
                self.finish(data)

class GetListHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        print(self.request)
        self.finish(json.dumps({
            "data": "file is created la!"
        }))  


    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        print(input_data)
        
        action = input_data["action"]
        print(action)
        extension = input_data["extension"]
        print(extension)

        if ( action == 'get-list'):
            filelist = GetFileList(extension)
            self.finish(filelist)
        elif (action == 'delete'):
            filename = input_data["file"]
            print("delete file: ", filename)
            os.remove(packrat_cache + "/" + filename)

            filelist = GetFileList(extension)
            self.finish(filelist)
        else:
            self.write(action, "unknown")   # 0 is the default case if x is not found


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    program_pattern = url_path_join(base_url, "webds-api", "start-program")
    
    upload_pattern = url_path_join(base_url, "webds-api", "upload")

    get_list_pattern = url_path_join(base_url, "webds-api", "manage-file")
    
    handlers = [(program_pattern, ProgramHandler), (upload_pattern, UploadHandler), (get_list_pattern, GetListHandler)]

    web_app.add_handlers(host_pattern, handlers)