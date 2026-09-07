package com.eddesignerez.ezdeck

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class EzDeckDiscoveryTest {
    @Test
    fun parsesOnlyValidDiscoveryReplies() {
        assertEquals("http://192.168.1.9:3000/", EzDeckDiscovery.parseReply("ezdeck:192.168.1.9:3000"))
        assertNull(EzDeckDiscovery.parseReply("ezdeck:999.168.1.9:3000"))
        assertNull(EzDeckDiscovery.parseReply("ezdeck:192.168.1.9:0"))
        assertNull(EzDeckDiscovery.parseReply("ezdeck:192.168.1.9:65536"))
        assertNull(EzDeckDiscovery.parseReply("other:192.168.1.9:3000"))
    }

    @Test
    fun healthContractIsStrict() {
        assertEquals("http://192.168.1.9:3000/health", EzDeckDiscovery.healthUrl("http://192.168.1.9:3000/"))
        assertNull(EzDeckDiscovery.healthUrl("http://192.168.1.9:3000/private"))
        assertTrue(EzDeckDiscovery.isEzDeckHealth(200, "{\"ok\":true,\"service\":\"EzDeck\"}"))
        assertFalse(EzDeckDiscovery.isEzDeckHealth(200, "{\"ok\":true,\"service\":\"Other\"}"))
        assertFalse(EzDeckDiscovery.isEzDeckHealth(401, "{\"ok\":true,\"service\":\"EzDeck\"}"))
    }

    @Test
    fun healthPatternEscapesClosingObjectBraceForAndroidIcu() {
        val field = EzDeckDiscovery::class.java.getDeclaredField("healthPattern").apply {
            isAccessible = true
        }
        val pattern = (field.get(EzDeckDiscovery) as Regex).pattern

        assertTrue("Android ICU requires the closing object brace to be escaped", pattern.contains("\\}"))
    }
}
