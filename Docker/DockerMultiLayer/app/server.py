#
# Author: Rohtash Lakra
#
from flask import Flask, request
from markupsafe import escape


def create_app():
    app = Flask(__name__)

    @app.route("/")
    def index():
        """The base end-point"""
        if request.args:
            value = request.args.get('name')
            message = f"<h1 style='color:blue'>Hello {escape(value)}!</h1>"
        else:
            message = "<h1 style='color:blue'>Hello There!</h1>"

        return message

    return app
