const crypto = require('crypto');
const MedicalRecord = require('../models/MedicalRecord');

const GENESIS_HASH = 'GENESIS';

const toIsoDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

const sha256 = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

const buildPayload = (record) => ({
  title: record.title || '',
  recordType: record.recordType || '',
  recordDate: toIsoDate(record.recordDate),
  doctorName: record.doctorName || '',
  hospitalName: record.hospitalName || '',
  notes: record.notes || '',
  attachmentName: record.attachmentName || '',
  attachmentType: record.attachmentType || '',
  attachmentDataHash: sha256(record.attachmentData || ''),
});

const buildRecordHash = ({ patientId, chainIndex, previousHash, payloadHash }) =>
  sha256(`${patientId}|${chainIndex}|${previousHash}|${payloadHash}`);

async function rebuildPatientRecordChain(patientId) {
  const records = await MedicalRecord.find({ patient: patientId })
    .sort({ recordDate: 1, createdAt: 1, _id: 1 })
    .select(
      '_id patient title recordType recordDate doctorName hospitalName notes attachmentName attachmentType attachmentData'
    );

  let previousHash = GENESIS_HASH;
  const operations = [];

  records.forEach((record, idx) => {
    const chainIndex = idx + 1;
    const payloadHash = sha256(JSON.stringify(buildPayload(record)));
    const recordHash = buildRecordHash({
      patientId: record.patient.toString(),
      chainIndex,
      previousHash,
      payloadHash,
    });

    operations.push({
      updateOne: {
        filter: { _id: record._id },
        update: {
          $set: {
            chainIndex,
            previousHash,
            payloadHash,
            recordHash,
            isChainVerified: true,
            lastVerifiedAt: new Date(),
          },
        },
      },
    });

    previousHash = recordHash;
  });

  if (operations.length > 0) {
    await MedicalRecord.bulkWrite(operations);
  }
}

async function verifyPatientRecordChain(patientId) {
  const records = await MedicalRecord.find({ patient: patientId })
    .sort({ chainIndex: 1, createdAt: 1, _id: 1 })
    .select(
      '_id patient title recordType recordDate doctorName hospitalName notes attachmentName attachmentType attachmentData chainIndex previousHash payloadHash recordHash'
    );

  if (records.length === 0) {
    return {
      ok: true,
      message: 'No records found for this patient.',
      count: 0,
    };
  }

  let previousHash = GENESIS_HASH;
  for (let i = 0; i < records.length; i += 1) {
    const entry = records[i];
    const expectedIndex = i + 1;
    const expectedPayloadHash = sha256(JSON.stringify(buildPayload(entry)));
    const expectedRecordHash = buildRecordHash({
      patientId: entry.patient.toString(),
      chainIndex: expectedIndex,
      previousHash,
      payloadHash: expectedPayloadHash,
    });

    const valid =
      entry.chainIndex === expectedIndex &&
      entry.previousHash === previousHash &&
      entry.payloadHash === expectedPayloadHash &&
      entry.recordHash === expectedRecordHash;

    if (!valid) {
      return {
        ok: false,
        message: 'Record chain validation failed.',
        failedAtRecordId: entry._id.toString(),
        expected: {
          chainIndex: expectedIndex,
          previousHash,
          payloadHash: expectedPayloadHash,
          recordHash: expectedRecordHash,
        },
        actual: {
          chainIndex: entry.chainIndex,
          previousHash: entry.previousHash,
          payloadHash: entry.payloadHash,
          recordHash: entry.recordHash,
        },
      };
    }

    previousHash = entry.recordHash;
  }

  return {
    ok: true,
    message: 'Record chain is valid.',
    count: records.length,
  };
}

module.exports = {
  GENESIS_HASH,
  rebuildPatientRecordChain,
  verifyPatientRecordChain,
};
