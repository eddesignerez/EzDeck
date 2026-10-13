package com.eddesignerez.ezdeck

/** Pure policy: completion alone never grants consent or permits a downgrade. */
internal object UpdateDownloadPolicy {
    enum class Action { WAIT, FORGET, FAIL, VALIDATE }

    fun next(foreground: Boolean, id: Long?, version: String?, installed: String, status: Int?): Action {
        if (id == null || id <= 0 || !foreground) return Action.WAIT
        if (!UpdateVersion.isNewer(version, installed)) return Action.FORGET
        return when (status) {
            1, 2, 4 -> Action.WAIT // DownloadManager: pending, running, paused
            8 -> Action.VALIDATE // Successful download still requires signature validation.
            else -> Action.FAIL
        }
    }
}
