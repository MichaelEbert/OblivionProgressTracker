# -*- coding: utf-8 -*-
#test on python 3.4 ,python of lower version  has different module organization.
#https://gist.github.com/HaiyangXu/ec88cbdce3cdbac7b8d5
import http.server
from http.server import HTTPServer, BaseHTTPRequestHandler
import socketserver
import socket
import sys
PORT = 8080

if len(sys.argv) > 1:
    PORT = int(sys.argv[1])

Handler = http.server.SimpleHTTPRequestHandler

Handler.extensions_map={
        '.manifest': 'text/cache-manifest',
	'.html': 'text/html',
        '.png': 'image/png',
	'.jpg': 'image/jpg',
	'.webp': 'image/webp',
	'.svg':	'image/svg+xml',
	'.css':	'text/css',
	'.js':	'application/javascript',
	'.json':	'application/json',
	'.mjs':	'application/javascript',
	'': 'application/octet-stream', # Default
    }
class HTTP6Server(HTTPServer):
	address_family = socket.AF_INET6

httpd = HTTP6Server(("::", PORT), Handler)

print("serving at port", PORT)
httpd.serve_forever()
