import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useActivityStore } from '../../store/activityStore';
import { Card } from '../common/Card';
import { spacing } from '../../../theme/spacing';

export const PedometerWidget = () => {
  const { colors } = useTheme();
  const { 
    stepsCount, 
    stepsGoal, 
    isPedometerAvailable,
    addSteps, 
    checkMidnightReset 
  } = useActivityStore();

  const [isSandboxExpanded, setIsSandboxExpanded] = useState(false);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Perform a midnight check on mount
  useEffect(() => {
    checkMidnightReset();
  }, []);

  // Auto-walk Simulation Interval
  useEffect(() => {
    let timer: any;
    if (isAutoWalking) {
      timer = setInterval(() => {
        addSteps(12); // Simulate walking: 12 steps every 500ms
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoWalking]);

  const progress = Math.min(stepsCount / stepsGoal, 1);
  
  // Circular progress math
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Card style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="footsteps" size={20} color={colors.accent} style={styles.headerIcon} />
          <Text style={[styles.title, { color: colors.text }]}>Daily Activity</Text>
        </View>
        
        {/* Sandbox Walk toggle badge */}
        <TouchableOpacity 
          onPress={() => setIsSandboxExpanded(!isSandboxExpanded)}
          style={[styles.sandboxToggle, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
        >
          <Ionicons name="construct" size={12} color={colors.accent} />
          <Text style={[styles.sandboxToggleText, { color: colors.textMuted }]}>
            {isSandboxExpanded ? "Hide Sim" : "Walk Sim"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.progressContainer}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              <Circle
                stroke={colors.border}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <Circle
                stroke={colors.accent}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.innerContent}>
            <Text style={[styles.stepText, { color: colors.text }]}>{stepsCount}</Text>
            <Text style={[styles.goalText, { color: colors.textMuted }]}>/ {stepsGoal} steps</Text>
          </View>
        </View>

        {/* Dynamic status helper */}
        <View style={styles.statusBadgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: colors.surfaceAlt }]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isPedometerAvailable === 'available' ? colors.accent : colors.warning }
            ]} />
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              {isPedometerAvailable === 'available' 
                ? "Pedometer Active" 
                : isPedometerAvailable === 'checking'
                ? "Checking Sensors..."
                : "Shake Device / Use Sim"
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded Sandbox Controls */}
      {isSandboxExpanded && (
        <View style={[styles.sandboxContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={styles.sandboxHeader}>
            <Ionicons name="walk" size={14} color={colors.accent} />
            <Text style={[styles.sandboxTitle, { color: colors.text }]}>Walk & Steps Simulator</Text>
          </View>
          <Text style={[styles.sandboxSub, { color: colors.textMuted }]}>
            Simulate physical steps to test progress meters, goal-completion triggers, and visual rings.
          </Text>
          
          <View style={styles.sandboxActions}>
            <TouchableOpacity 
              onPress={() => addSteps(100)}
              style={[styles.sandboxBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.sandboxBtnText, { color: colors.accent }]}>+100 Steps</Text>
            </TouchableOpacity>

            <View style={styles.walkSimToggleRow}>
              <Text style={[styles.walkSimLabel, { color: colors.text }]}>Auto-Walk</Text>
              <Switch
                value={isAutoWalking}
                onValueChange={setIsAutoWalking}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    width: '94%',
    alignSelf: 'center',
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sandboxToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  sandboxToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 32,
    fontWeight: '800',
  },
  goalText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadgeRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sandboxContainer: {
    marginTop: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sandboxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  sandboxSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.md,
  },
  sandboxActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sandboxBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sandboxBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  walkSimToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  walkSimLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
