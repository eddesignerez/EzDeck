package com.eddesignerez.ezdeck

import org.junit.Assert.assertEquals
import org.junit.Test

class UpdateDownloadPolicyTest {
    @Test fun successfulAuthorizedDownloadContinuesAfterResume() {
        assertEquals(UpdateDownloadPolicy.Action.WAIT, UpdateDownloadPolicy.next(false, 42, "0.2.13", "0.2.12", 8))
        assertEquals(UpdateDownloadPolicy.Action.VALIDATE, UpdateDownloadPolicy.next(true, 42, "0.2.13", "0.2.12", 8))
    }

    @Test fun unrelatedDownloadsAndOldVersionsCannotInstall() {
        assertEquals(UpdateDownloadPolicy.Action.WAIT, UpdateDownloadPolicy.next(true, null, "0.2.13", "0.2.12", 8))
        assertEquals(UpdateDownloadPolicy.Action.WAIT, UpdateDownloadPolicy.next(true, -1, "0.2.13", "0.2.12", 8))
        for (version in listOf(null, "latest", "0.2.11", "0.2.12")) {
            assertEquals(UpdateDownloadPolicy.Action.FORGET, UpdateDownloadPolicy.next(true, 42, version, "0.2.12", 8))
        }
    }

    @Test fun unfinishedDownloadsWaitAndFailuresNeverInstall() {
        for (status in listOf(1, 2, 4)) {
            assertEquals(UpdateDownloadPolicy.Action.WAIT, UpdateDownloadPolicy.next(true, 42, "0.2.13", "0.2.12", status))
        }
        for (status in listOf(null, 16, 999)) {
            assertEquals(UpdateDownloadPolicy.Action.FAIL, UpdateDownloadPolicy.next(true, 42, "0.2.13", "0.2.12", status))
        }
    }
}
