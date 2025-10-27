/**
 * Medical Example Component
 * Demonstrates FHE usage for private medical data management
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useEncryption } from '../../hooks/useEncryption';
import { useComputation } from '../../hooks/useComputation';
import { useFHEContext } from '../fhe/FHEProvider';

interface MedicalRecord {
  bloodPressure: string;
  heartRate: string;
  bloodSugar: string;
  temperature: string;
}

export function MedicalExample() {
  const { client, isReady } = useFHEContext();
  const { encrypt, isEncrypting } = useEncryption(client);
  const { compute, isComputing } = useComputation();

  const [patientId, setPatientId] = useState('');
  const [medicalData, setMedicalData] = useState<MedicalRecord>({
    bloodPressure: '',
    heartRate: '',
    bloodSugar: '',
    temperature: ''
  });

  const [encryptedRecords, setEncryptedRecords] = useState<Map<string, string>>(new Map());
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const contractAddress = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';

  const addLog = (message: string) => {
    setActivityLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleEncryptRecord = async () => {
    if (!patientId) {
      alert('Please enter Patient ID');
      return;
    }

    try {
      const records = new Map<string, string>();

      // Encrypt blood pressure (systolic)
      if (medicalData.bloodPressure) {
        const encrypted = await encrypt(parseInt(medicalData.bloodPressure, 10), {
          type: 'euint16',
          contractAddress
        });
        records.set('bloodPressure', encrypted.handles);
        addLog(`Blood pressure encrypted for patient ${patientId}`);
      }

      // Encrypt heart rate
      if (medicalData.heartRate) {
        const encrypted = await encrypt(parseInt(medicalData.heartRate, 10), {
          type: 'euint8',
          contractAddress
        });
        records.set('heartRate', encrypted.handles);
        addLog(`Heart rate encrypted for patient ${patientId}`);
      }

      // Encrypt blood sugar
      if (medicalData.bloodSugar) {
        const encrypted = await encrypt(parseInt(medicalData.bloodSugar, 10), {
          type: 'euint16',
          contractAddress
        });
        records.set('bloodSugar', encrypted.handles);
        addLog(`Blood sugar encrypted for patient ${patientId}`);
      }

      // Encrypt temperature (multiply by 10 to preserve decimal)
      if (medicalData.temperature) {
        const temp = Math.round(parseFloat(medicalData.temperature) * 10);
        const encrypted = await encrypt(temp, {
          type: 'euint16',
          contractAddress
        });
        records.set('temperature', encrypted.handles);
        addLog(`Temperature encrypted for patient ${patientId}`);
      }

      setEncryptedRecords(records);
      addLog(`Medical records encrypted successfully for patient ${patientId}`);
    } catch (err) {
      addLog(`Error encrypting records: ${err}`);
    }
  };

  const handleCheckBloodPressure = async () => {
    const bpHandle = encryptedRecords.get('bloodPressure');
    if (!bpHandle) {
      alert('Please encrypt blood pressure first');
      return;
    }

    try {
      // Normal blood pressure threshold: 120 mmHg (systolic)
      const threshold = await encrypt(120, {
        type: 'euint16',
        contractAddress
      });

      // Check if blood pressure > threshold
      const result = await compute('gt', [bpHandle, threshold.handles], contractAddress);

      addLog(`Blood pressure check completed`);
      setComparisonResult(
        `Blood pressure comparison result (encrypted): ${result.handle.substring(0, 30)}...`
      );
    } catch (err) {
      addLog(`Error checking blood pressure: ${err}`);
    }
  };

  const handleCheckHeartRate = async () => {
    const hrHandle = encryptedRecords.get('heartRate');
    if (!hrHandle) {
      alert('Please encrypt heart rate first');
      return;
    }

    try {
      // Normal resting heart rate range: 60-100 bpm
      const lowerBound = await encrypt(60, {
        type: 'euint8',
        contractAddress
      });
      const upperBound = await encrypt(100, {
        type: 'euint8',
        contractAddress
      });

      // Check if heart rate is within normal range
      const gteLower = await compute('gte', [hrHandle, lowerBound.handles], contractAddress);
      const lteUpper = await compute('lte', [hrHandle, upperBound.handles], contractAddress);

      addLog(`Heart rate range check completed`);
      setComparisonResult(
        `Heart rate within normal range check completed (encrypted results)`
      );
    } catch (err) {
      addLog(`Error checking heart rate: ${err}`);
    }
  };

  const handleCheckBloodSugar = async () => {
    const bsHandle = encryptedRecords.get('bloodSugar');
    if (!bsHandle) {
      alert('Please encrypt blood sugar first');
      return;
    }

    try {
      // Normal fasting blood sugar: < 100 mg/dL
      const threshold = await encrypt(100, {
        type: 'euint16',
        contractAddress
      });

      const result = await compute('lt', [bsHandle, threshold.handles], contractAddress);

      addLog(`Blood sugar check completed`);
      setComparisonResult(
        `Blood sugar comparison result (encrypted): ${result.handle.substring(0, 30)}...`
      );
    } catch (err) {
      addLog(`Error checking blood sugar: ${err}`);
    }
  };

  const handleReset = () => {
    setMedicalData({
      bloodPressure: '',
      heartRate: '',
      bloodSugar: '',
      temperature: ''
    });
    setEncryptedRecords(new Map());
    setComparisonResult(null);
    setPatientId('');
  };

  const isProcessing = isEncrypting || isComputing;

  return (
    <Card
      title="Private Medical Records Example"
      description="Secure medical data storage and analysis with encrypted patient records"
    >
      <div className="space-y-6">
        {/* Patient ID */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Input
            label="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={encryptedRecords.size > 0 || isProcessing}
            placeholder="Enter patient identifier"
          />
        </div>

        {/* Medical Data Input */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900">Enter Medical Data</h4>

          <Input
            label="Blood Pressure (Systolic, mmHg)"
            type="number"
            value={medicalData.bloodPressure}
            onChange={(e) => setMedicalData(prev => ({ ...prev, bloodPressure: e.target.value }))}
            disabled={encryptedRecords.size > 0 || isProcessing}
            placeholder="e.g., 120"
            helperText="Normal range: 90-120 mmHg"
          />

          <Input
            label="Heart Rate (BPM)"
            type="number"
            value={medicalData.heartRate}
            onChange={(e) => setMedicalData(prev => ({ ...prev, heartRate: e.target.value }))}
            disabled={encryptedRecords.size > 0 || isProcessing}
            placeholder="e.g., 72"
            helperText="Normal range: 60-100 BPM"
          />

          <Input
            label="Blood Sugar (mg/dL)"
            type="number"
            value={medicalData.bloodSugar}
            onChange={(e) => setMedicalData(prev => ({ ...prev, bloodSugar: e.target.value }))}
            disabled={encryptedRecords.size > 0 || isProcessing}
            placeholder="e.g., 95"
            helperText="Normal fasting: 70-100 mg/dL"
          />

          <Input
            label="Body Temperature (°C)"
            type="number"
            step="0.1"
            value={medicalData.temperature}
            onChange={(e) => setMedicalData(prev => ({ ...prev, temperature: e.target.value }))}
            disabled={encryptedRecords.size > 0 || isProcessing}
            placeholder="e.g., 36.6"
            helperText="Normal range: 36.1-37.2°C"
          />
        </div>

        {/* Encrypt Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleEncryptRecord}
            disabled={!patientId || encryptedRecords.size > 0 || !isReady || isProcessing}
            isLoading={isProcessing}
          >
            Encrypt Medical Records
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={encryptedRecords.size === 0}
          >
            Reset
          </Button>
        </div>

        {/* Health Checks */}
        {encryptedRecords.size > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <h4 className="font-medium text-green-900">Privacy-Preserving Health Checks</h4>
            <p className="text-sm text-green-700">
              Perform comparisons on encrypted data without revealing actual values
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleCheckBloodPressure}
                disabled={!encryptedRecords.has('bloodPressure') || isProcessing}
                isLoading={isProcessing}
              >
                Check Blood Pressure
              </Button>
              <Button
                size="sm"
                onClick={handleCheckHeartRate}
                disabled={!encryptedRecords.has('heartRate') || isProcessing}
                isLoading={isProcessing}
              >
                Check Heart Rate
              </Button>
              <Button
                size="sm"
                onClick={handleCheckBloodSugar}
                disabled={!encryptedRecords.has('bloodSugar') || isProcessing}
                isLoading={isProcessing}
              >
                Check Blood Sugar
              </Button>
            </div>
          </div>
        )}

        {/* Encrypted Records Display */}
        {encryptedRecords.size > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Encrypted Medical Records</h4>
            <div className="space-y-2">
              {Array.from(encryptedRecords.entries()).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <p className="font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </p>
                  <p className="text-xs font-mono text-gray-600 break-all">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">All data is encrypted and private</p>
          </div>
        )}

        {/* Comparison Result */}
        {comparisonResult && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">{comparisonResult}</p>
          </div>
        )}

        {/* Activity Log */}
        {activityLog.length > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Activity Log</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {activityLog.map((log, index) => (
                <p key={index} className="text-xs text-gray-600 font-mono">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
