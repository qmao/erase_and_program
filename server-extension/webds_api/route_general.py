import tornado
from jupyter_server.base.handlers import APIHandler
import os
import json
from . import utils


class GeneralHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        print(self.request)

        utils.UpdateWorkspace()

        self.finish(json.dumps({
            "data": "webds-api server is running"
        }))