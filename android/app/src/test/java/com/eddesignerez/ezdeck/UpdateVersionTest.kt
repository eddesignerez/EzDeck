package com.eddesignerez.ezdeck

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateVersionTest {
    @Test
    fun githubLookupAcceptsOnlyOurStableReleaseRedirect() {
        assertTrue(UpdateVersion.githubReleaseVersion("https://github.com/eddesignerez/EzDeck/releases/tag/v0.2.13") == "0.2.13")
        assertTrue(UpdateVersion.githubReleaseVersion("/eddesignerez/EzDeck/releases/tag/v0.2.13") == "0.2.13")
        for (location in listOf(null, "https://evil.example/releases/tag/v9.0.0", "https://github.com/other/EzDeck/releases/tag/v9.0.0", "https://github.com/eddesignerez/EzDeck/releases/tag/v1.2.3-beta", "https://github.com/eddesignerez/EzDeck/releases/tag/v1.2.3/ezdeck.apk")) {
            assertTrue(UpdateVersion.githubReleaseVersion(location) == null)
        }
    }
    @Test
    fun equalVersionsDoNotTriggerAnUpdate() {
        assertFalse(UpdateVersion.isNewer("v0.2.6", "0.2.6"))
    }

    @Test
    fun newerVersionTriggersAnUpdate() {
        assertTrue(UpdateVersion.isNewer("v0.2.7", "0.2.6"))
    }

    @Test
    fun releaseTagIsStrictAndCanonical() {
        assertTrue(UpdateVersion.releaseTag("0.2.7") == "v0.2.7")
        assertTrue(UpdateVersion.releaseTag("v0.2.7") == "v0.2.7")
        assertTrue(UpdateVersion.releaseTag("latest") == null)
    }

    @Test
    fun apkAssetNameFollowsPublishedVersion() {
        assertTrue(UpdateVersion.apkAssetName("0.2.15") == "EzDeck0215.apk")
        assertTrue(UpdateVersion.apkAssetName("latest") == null)
    }
}
