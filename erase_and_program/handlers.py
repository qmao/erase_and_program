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

import sys
sys.path.append("/usr/local/syna/python")
from touchcomm import TouchComm
from programmer import AsicProgrammer

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
        
        filename = os.path.join('/packrat', input_data["filename"])
        print(filename)

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
                save_father_path = '/packrat'
                ##img_path = os.path.join(save_father_path, str(uuid.uuid1()) + '.' + secure_filename(f.filename).split('.')[-1])

                ### regular expression to find packrat number
                if not os.path.exists(save_father_path):
                    os.makedirs(save_father_path)

                file_path = os.path.join(save_father_path, filename)
                print(file_path)

                with open(file_path, 'wb') as f:
                    f.write(body)

        self.write("OK")
        

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    program_pattern = url_path_join(base_url, "webds-api", "start-program")
    
    upload_pattern = url_path_join(base_url, "webds-api", "upload")

    handlers = [(program_pattern, ProgramHandler), (upload_pattern, UploadHandler)]

    web_app.add_handlers(host_pattern, handlers)
