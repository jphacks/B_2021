import sys, site, os

env = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))), '334jst_venv/lib/python3.6/site-packages')
current = os.path.abspath(os.path.dirname(__file__))

site.addsitedir(env)

sys.path.insert(0,current)

from web import app as application
