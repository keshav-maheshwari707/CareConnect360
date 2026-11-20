import sys

# On Windows localhost, pure-Python pymysql acts as the MySQLdb driver
# to avoid Windows Application Control blocking compiled mysqlclient C-extensions.
# On Linux (Render production), mysqlclient is used natively.
if sys.platform == 'win32':
    try:
        import MySQLdb  # noqa: F401
    except Exception:
        try:
            import pymysql
            pymysql.install_as_MySQLdb()
        except ImportError:
            pass
