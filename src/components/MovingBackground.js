import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

const MovingBackground = () => {
    const moveAnim1 = useRef(new Animated.Value(0)).current;
    const moveAnim2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (anim, duration, delay = 0) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: duration,
                        delay: delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animate(moveAnim1, 20000);
        animate(moveAnim2, 25000, 5000);
    }, []);

    const translate1 = moveAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 50],
    });

    const translate2 = moveAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50],
    });

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.background}>
                <Animated.View
                    style={[
                        styles.blob,
                        styles.blob1,
                        { transform: [{ translateX: translate1 }, { translateY: translate1 }] },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.blob,
                        styles.blob2,
                        { transform: [{ translateX: translate2 }, { translateY: translate2 }] },
                    ]}
                />
            </View>
            <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark">
                <View style={styles.overlay} />
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    blob: {
        position: "absolute",
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        opacity: 0.6,
    },
    blob1: {
        backgroundColor: "#4f000b", // Dark Red
        top: -width * 0.2,
        left: -width * 0.2,
    },
    blob2: {
        backgroundColor: "#1a0b2e", // Dark Purple
        bottom: -width * 0.2,
        right: -width * 0.2,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
});

export default MovingBackground;
