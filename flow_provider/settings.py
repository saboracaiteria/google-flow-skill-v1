"""
Configuracion del provider standalone de Google Flow.

La sesion persistente vive DENTRO de esta skill (session/flowbot-profile),
para que sea portable: descargar la carpeta, loguearse una vez y listo.
"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    base_dir = Path(__file__).parent.parent.resolve()
    if (base_dir / ".env").exists():
        load_dotenv(base_dir / ".env")
except Exception:
    base_dir = Path(__file__).parent.parent.resolve()

# Mostrar el navegador (recomendado: false = visible). En CI se puede poner true.
FLOW_HEADLESS = os.getenv("FLOW_HEADLESS", "false").lower() == "true"

# Sesion persistente de Chrome dentro de la skill.
FLOW_CHROME_PROFILE = os.getenv(
    "FLOW_CHROME_PROFILE",
    str(base_dir / "session" / "flowbot-profile"),
)

# Modo legacy (no se usa): sesion via storage_state JSON.
FLOW_SESSION_FILE = os.getenv("FLOW_SESSION_FILE", "")

# --- Chrome persistente via CDP -------------------------------------------
# Cuando esta activo, un Chrome real (con el perfil de session/) queda ABIERTO
# en una puerta de depuracion y los comandos solo se conectan/desconectan:
# la ventana ya no se cierra entre ejecuciones (mas rapido y estable).
FLOW_USE_CDP = os.getenv("FLOW_USE_CDP", "true").lower() == "true"
FLOW_CDP_PORT = int(os.getenv("FLOW_CDP_PORT", "9223"))
FLOW_CDP_HOST = os.getenv("FLOW_CDP_HOST", "127.0.0.1")
FLOW_CDP_URL = os.getenv("FLOW_CDP_URL", f"http://{FLOW_CDP_HOST}:{FLOW_CDP_PORT}")
# Si no hay Chrome en la puerta al arrancar, lanzar uno destacado automaticamente.
FLOW_CDP_AUTO_LAUNCH = os.getenv("FLOW_CDP_AUTO_LAUNCH", "true").lower() == "true"
