"""BT38 old marketplace path shutdown compatibility shim.

This module keeps legacy imports available while forcing retired marketplace
paths to return disabled responses. It must not start workers, syncs, imports,
pushes, schedulers, or marketplace execution.
"""

from typing import Any, Dict

OLD_SYNC_DISABLED = True
MARKETPLACE_EXECUTION_DISABLED = True
GOVERNED_PATH_REQUIRED = True


def disabled_response(action: str = "old_path", **context: Any) -> Dict[str, Any]:
    """Return a safe disabled response for retired legacy paths."""
    return {
        "success": False,
        "ok": False,
        "disabled": True,
        "old_sync_disabled": OLD_SYNC_DISABLED,
        "marketplace_execution_disabled": MARKETPLACE_EXECUTION_DISABLED,
        "governed_path_required": GOVERNED_PATH_REQUIRED,
        "action": action,
        "reason": "OLD_PATH_DISABLED_GOVERNED_PATH_REQUIRED",
        "message": "Legacy marketplace path is disabled. Use governed execution.",
        **context,
    }


class DisabledMarketplaceService:
    """Compatibility base class for retired legacy marketplace services."""

    OLD_SYNC_DISABLED = OLD_SYNC_DISABLED
    MARKETPLACE_EXECUTION_DISABLED = MARKETPLACE_EXECUTION_DISABLED
    GOVERNED_PATH_REQUIRED = GOVERNED_PATH_REQUIRED

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        self.args = args
        self.kwargs = kwargs

    def disabled_response(self, action: str = "legacy_service", **context: Any) -> Dict[str, Any]:
        return disabled_response(action, **context)

    def __getattr__(self, name: str):
        def disabled_callable(*args: Any, **kwargs: Any) -> Dict[str, Any]:
            return disabled_response(name, args=args, kwargs=kwargs)
        return disabled_callable
