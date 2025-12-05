import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { theme } from "../constants/theme";

const MESSAGES = [
    "Initializing MovieBox protocol...",
    "Scanning mirror hosts...",
    "Bypassing geo-restrictions...",
    "Resolving high-speed streams...",
    "Optimizing buffer...",
    "Access granted."
];

const LoadingTerminal = () => {
    const [lines, setLines] = useState([]);
    const [cursorOpacity] = useState(new Animated.Value(1));

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < MESSAGES.length) {
                setLines((prev) => [...prev, MESSAGES[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 800);

        Animated.loop(
            Animated.sequence([
                Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
                Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        ).start();

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            {lines.map((line, index) => (
                <Text key={index} style={styles.line}>
                    <Text style={styles.prompt}>{">"}</Text> {line}
                </Text>
            ))}
            <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.m,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#0f0",
        width: "80%",
        alignSelf: "center",
    },
    line: {
        color: "#0f0",
        fontFamily: "monospace",
        marginBottom: 4,
        fontSize: 14,
    },
    prompt: {
        fontWeight: "bold",
    },
    cursor: {
        width: 10,
        height: 16,
        backgroundColor: "#0f0",
        marginTop: 4,
    },
});

export default LoadingTerminal;
