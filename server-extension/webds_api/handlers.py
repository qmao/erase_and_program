from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

import tornado

from .route_program import ProgramHandler
from .route_general import GeneralHandler
from .route_packrat import PackratHandler




import logging
import json
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import uuid

from tornado.options import define, options


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]

    general_pattern = url_path_join(base_url, "webds-api", "general")
        
    program_pattern = url_path_join(base_url, "webds-api", "program")

    packrat_pattern = url_path_join(base_url, "webds-api", "packrat" + '(.*)')

    
    handlers = [(general_pattern, GeneralHandler), (program_pattern, ProgramHandler), (packrat_pattern, PackratHandler),
                (r"/hello", MainHandler), (r"/echo", EchoWebSocket)]

    web_app.add_handlers(host_pattern, handlers)



class MainHandler(APIHandler):
    @tornado.web.authenticated
    def on_message(self, message):
        print("on message")
        self.write_message(message)


class EchoWebSocket(tornado.websocket.WebSocketHandler):
    @tornado.web.authenticated
    def on_message(self, message):
        print("on message")
        self.write_message(message)
        
    def get(self):
    
        print(self.request.headers.get("Upgrade", "").lower())
        print(self.request.headers)
        
        print("on get")

        self.write_message("You are connected")


