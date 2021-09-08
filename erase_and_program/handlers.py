import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from pathlib import Path

import logging

import os

import tornado
import uuid
from werkzeug import secure_filename
import grp, pwd
import glob
import re

import sys
sys.path.append("/usr/local/syna/python")
from touchcomm import TouchComm
from programmer import AsicProgrammer

packrat_cache = "/usr/local/syna/cache/packrat"

def GetFileList(extension):
    filelist = []
    os.chdir(packrat_cache)
    for file in glob.glob("**/*." + extension):
        print(file)
        filelist += [str(file)]

    # printing result
    print("The list after appending is : " + str(filelist))
    jsonString = json.dumps(filelist)
    return jsonString

def GetSymbolValue(symbol, content):
    find=r'(?<='+ symbol + r'=").*(?=")'
    x = re.findall(find, content)
    print(len(x))
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

                packrat_dir = GetSymbolValue("PACKRAT_ID", body.decode('utf-8'))
                print(packrat_dir)

                path = os.path.join(packrat_cache, packrat_dir)
                if not os.path.exists(path):
                    os.makedirs(path)

                file_path = os.path.join(path, filename)
                print(file_path)

                with open(file_path, 'wb') as f:
                    f.write(body)

                filelist = GetFileList('hex')
                self.finish(filelist)

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
