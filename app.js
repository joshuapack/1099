let currentFormType = 'NEC';

function switchForm(type) {
    currentFormType = type;
    
    const necTab = document.getElementById('tabNec');
    const miscTab = document.getElementById('tabMisc');
    
    if (type === 'NEC') {
        necTab.classList.add('active');
        miscTab.classList.remove('active');
    } else {
        miscTab.classList.add('active');
        necTab.classList.remove('active');
    }

    // Toggle amount sections for all recipients
    const allNec = document.querySelectorAll('.nec-amounts');
    const allMisc = document.querySelectorAll('.misc-amounts');

    allNec.forEach(el => type === 'NEC' ? el.classList.remove('hidden') : el.classList.add('hidden'));
    allMisc.forEach(el => type === 'MISC' ? el.classList.remove('hidden') : el.classList.add('hidden'));
}

function addRecipient() {
    const container = document.getElementById('recipientsContainer');
    const template = document.getElementById('recipientTemplate');
    const clone = template.content.cloneNode(true);
    
    const count = container.querySelectorAll('.recipient-entry').length + 1;
    clone.querySelector('.label-idx').textContent = count;
    
    // Ensure correct visibility of amount sections
    if (currentFormType === 'NEC') {
        clone.querySelector('.nec-amounts').classList.remove('hidden');
        clone.querySelector('.misc-amounts').classList.add('hidden');
    } else {
        clone.querySelector('.nec-amounts').classList.add('hidden');
        clone.querySelector('.misc-amounts').classList.remove('hidden');
    }
    
    container.appendChild(clone);
}

function removeRecipient(btn) {
    const container = document.getElementById('recipientsContainer');
    if (container.querySelectorAll('.recipient-entry').length <= 1) {
        alert("You must have at least one recipient.");
        return;
    }
    const entry = btn.closest('.recipient-entry');
    entry.remove();
    
    // Update indices
    const entries = container.querySelectorAll('.recipient-entry');
    entries.forEach((el, idx) => {
        const span = el.querySelector('.label-idx');
        if (span) span.textContent = idx + 1;
    });
}

function getVal(parent, selector) {
    if (!parent || !selector) return '';
    const el = parent.querySelector(selector);
    return el ? el.value : '';
}

function getCheck(parent, selector) {
    if (!parent || !selector) return '0';
    const el = parent.querySelector(selector);
    return el && el.checked ? '1' : '0';
}

function escapeXml(unsafe) {
    return unsafe.toString().replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function generateXML() {
    // Header Data
    const headerData = {
        taxYear: document.getElementById('taxYear').value,
        submissionId: document.getElementById('submissionId').value,
        issuerTin: document.getElementById('issuerTin').value.replace(/\D/g, ''),
        issuerTinType: document.getElementById('issuerTinType').value,
        issuerName: document.getElementById('issuerName').value,
        issuerAddress: document.getElementById('issuerAddress').value,
        issuerCity: document.getElementById('issuerCity').value,
        issuerState: document.getElementById('issuerState').value,
        issuerZip: document.getElementById('issuerZip').value,
        issuerPhone: document.getElementById('issuerPhone').value.replace(/\D/g, ''),
        contactName: document.getElementById('contactName').value,
        contactEmail: document.getElementById('contactEmail').value
    };

    // Recipients Data
    const recipientEntries = document.querySelectorAll('.recipient-entry');
    const recipients = [];
    let totalAmt = 0;

    recipientEntries.forEach((entry, idx) => {
        const rcpnt = {
            recordId: idx + 1,
            tin: getVal(entry, '.field-rcpntTin').replace(/\D/g, ''),
            tinType: getVal(entry, '.field-rcpntTinType'),
            name: getVal(entry, '.field-rcpntName'),
            address: getVal(entry, '.field-rcpntAddress'),
            city: getVal(entry, '.field-rcpntCity'),
            state: getVal(entry, '.field-rcpntState'),
            zip: getVal(entry, '.field-rcpntZip'),
            void: getCheck(entry, '.field-void'),
            corrected: getCheck(entry, '.field-corrected'),
            secondTin: getCheck(entry, '.field-secondTin')
        };

        if (currentFormType === 'NEC') {
            rcpnt.amt1 = parseFloat(getVal(entry, '.field-nec1') || 0);
            rcpnt.ind2 = getCheck(entry, '.field-nec2');
            rcpnt.amt3 = parseFloat(getVal(entry, '.field-nec3') || 0);
            rcpnt.amt4 = parseFloat(getVal(entry, '.field-nec4') || 0);
            totalAmt += rcpnt.amt1;
        } else {
            rcpnt.m1 = parseFloat(getVal(entry, '.field-m1') || 0);
            rcpnt.m2 = parseFloat(getVal(entry, '.field-m2') || 0);
            rcpnt.m3 = parseFloat(getVal(entry, '.field-m3') || 0);
            rcpnt.m4 = parseFloat(getVal(entry, '.field-m4') || 0);
            rcpnt.m5 = parseFloat(getVal(entry, '.field-m5') || 0);
            rcpnt.m6 = parseFloat(getVal(entry, '.field-m6') || 0);
            rcpnt.m7 = getCheck(entry, '.field-m7');
            rcpnt.m8 = parseFloat(getVal(entry, '.field-m8') || 0);
            rcpnt.m9 = parseFloat(getVal(entry, '.field-m9') || 0);
            rcpnt.m10 = parseFloat(getVal(entry, '.field-m10') || 0);
            rcpnt.m11 = parseFloat(getVal(entry, '.field-m11') || 0);
            rcpnt.m12 = parseFloat(getVal(entry, '.field-m12') || 0);
            rcpnt.m13 = getCheck(entry, '.field-m13');
            rcpnt.m15 = parseFloat(getVal(entry, '.field-m15') || 0);
            totalAmt += rcpnt.m1;
        }
        recipients.push(rcpnt);
    });

    // Start Building XML
    let xml = `<?xml version="1.0" encoding="utf-16"?>
<IRSubmission1Grp xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="urn:us:gov:treasury:irs:ir">
  <IRSubmission1Header>
    <SubmissionId>${escapeXml(headerData.submissionId)}</SubmissionId>
    <TaxYr>${escapeXml(headerData.taxYear)}</TaxYr>
    <IssuerDetail>
      <ForeignEntityInd>0</ForeignEntityInd>
      <TIN>${escapeXml(headerData.issuerTin)}</TIN>
      <TINSubmittedTypeCd>${escapeXml(headerData.issuerTinType)}</TINSubmittedTypeCd>
      <BusinessName>
        <BusinessNameLine1Txt>${escapeXml(headerData.issuerName)}</BusinessNameLine1Txt>
      </BusinessName>
      <MailingAddressGrp>
        <USAddress>
          <AddressLine1Txt>${escapeXml(headerData.issuerAddress)}</AddressLine1Txt>
          <CityNm>${escapeXml(headerData.issuerCity)}</CityNm>
          <StateAbbreviationCd>${escapeXml(headerData.issuerState)}</StateAbbreviationCd>
          <ZIPCd>${escapeXml(headerData.issuerZip)}</ZIPCd>
        </USAddress>
      </MailingAddressGrp>
      <PhoneNum>${escapeXml(headerData.issuerPhone)}</PhoneNum>
    </IssuerDetail>`;

    if (headerData.contactName || headerData.contactEmail) {
        xml += `
    <ContactPersonInformationGrp>
      <ContactPersonNm>${escapeXml(headerData.contactName)}</ContactPersonNm>
      <ContactEmailAddressTxt>${escapeXml(headerData.contactEmail)}</ContactEmailAddressTxt>
    </ContactPersonInformationGrp>`;
    }

    xml += `
    <FormTypeCd>1099${currentFormType}</FormTypeCd>
    <ParentFormTypeCd>1096</ParentFormTypeCd>
    <CFSFElectionInd>0</CFSFElectionInd>
    <TotalReportedRcpntFormCnt>${recipients.length}</TotalReportedRcpntFormCnt>
    <IRSubmission1FormTotals>`;

    if (currentFormType === 'NEC') {
        xml += `
      <Form1099NECTotalAmtGrp>
        <NonemployeeCompensationAmt>${totalAmt.toFixed(2)}</NonemployeeCompensationAmt>
      </Form1099NECTotalAmtGrp>`;
    } else {
        xml += `
      <Form1099MISCTotalAmtGrp>
        <RentAmt>${totalAmt.toFixed(2)}</RentAmt>
      </Form1099MISCTotalAmtGrp>`;
    }

    xml += `
    </IRSubmission1FormTotals>
  </IRSubmission1Header>
  <IRSubmission1Detail>`;

    // Loop through recipients for details
    recipients.forEach(r => {
        if (currentFormType === 'NEC') {
            xml += `
    <Form1099NECDetail>
      <TaxYr>${escapeXml(headerData.taxYear)}</TaxYr>
      <RecordId>${r.recordId}</RecordId>
      <VoidInd>${r.void}</VoidInd>
      <CorrectedInd>${r.corrected}</CorrectedInd>
      <RecipientDetail>
        <TIN>${escapeXml(r.tin)}</TIN>
        <TINSubmittedTypeCd>${escapeXml(r.tinType)}</TINSubmittedTypeCd>
        <PersonName>
          <PersonFirstNm>${escapeXml(r.name)}</PersonFirstNm>
        </PersonName>
        <MailingAddressGrp>
          <USAddress>
            <AddressLine1Txt>${escapeXml(r.address)}</AddressLine1Txt>
            <CityNm>${escapeXml(r.city)}</CityNm>
            <StateAbbreviationCd>${escapeXml(r.state)}</StateAbbreviationCd>
            <ZIPCd>${escapeXml(r.zip)}</ZIPCd>
          </USAddress>
        </MailingAddressGrp>
      </RecipientDetail>
      <SecondTINNoticeInd>${r.secondTin}</SecondTINNoticeInd>
      <NonemployeeCompensationAmt>${r.amt1.toFixed(2)}</NonemployeeCompensationAmt>
      <DirectSaleAboveThresholdInd>${r.ind2}</DirectSaleAboveThresholdInd>
      <ExcessParachutePaymentAmt>${r.amt3.toFixed(2)}</ExcessParachutePaymentAmt>
      <FederalIncomeTaxWithheldAmt>${r.amt4.toFixed(2)}</FederalIncomeTaxWithheldAmt>
    </Form1099NECDetail>`;
        } else {
            xml += `
    <Form1099MISCDetail>
      <TaxYr>${escapeXml(headerData.taxYear)}</TaxYr>
      <RecordId>${r.recordId}</RecordId>
      <VoidInd>${r.void}</VoidInd>
      <CorrectedInd>${r.corrected}</CorrectedInd>
      <RecipientDetail>
        <TIN>${escapeXml(r.tin)}</TIN>
        <TINSubmittedTypeCd>${escapeXml(r.tinType)}</TINSubmittedTypeCd>
        <PersonName>
          <PersonFirstNm>${escapeXml(r.name)}</PersonFirstNm>
        </PersonName>
        <MailingAddressGrp>
          <USAddress>
            <AddressLine1Txt>${escapeXml(r.address)}</AddressLine1Txt>
            <CityNm>${escapeXml(r.city)}</CityNm>
            <StateAbbreviationCd>${escapeXml(r.state)}</StateAbbreviationCd>
            <ZIPCd>${escapeXml(r.zip)}</ZIPCd>
          </USAddress>
        </MailingAddressGrp>
      </RecipientDetail>
      <SecondTINNoticeInd>${r.secondTin}</SecondTINNoticeInd>
      <FATCAFilingRequirementInd>${r.m13}</FATCAFilingRequirementInd>
      <RentAmt>${r.m1.toFixed(2)}</RentAmt>
      <RoyaltyAmt>${r.m2.toFixed(2)}</RoyaltyAmt>
      <OtherIncomeAmt>${r.m3.toFixed(2)}</OtherIncomeAmt>
      <FederalIncomeTaxWithheldAmt>${r.m4.toFixed(2)}</FederalIncomeTaxWithheldAmt>
      <FishingBoatProceedsAmt>${r.m5.toFixed(2)}</FishingBoatProceedsAmt>
      <MedicalHealthCarePaymentsAmt>${r.m6.toFixed(2)}</MedicalHealthCarePaymentsAmt>
      <DirectSaleAboveThresholdInd>${r.m7}</DirectSaleAboveThresholdInd>
      <SubstitutePaymentsAmt>${r.m8.toFixed(2)}</SubstitutePaymentsAmt>
      <CropInsuranceProceedsAmt>${r.m9.toFixed(2)}</CropInsuranceProceedsAmt>
      <AttorneyGrossProceedsPaidAmt>${r.m10.toFixed(2)}</AttorneyGrossProceedsPaidAmt>
      <FishPurchasedForResaleAmt>${r.m11.toFixed(2)}</FishPurchasedForResaleAmt>
      <Section409ADeferralsAmt>${r.m12.toFixed(2)}</Section409ADeferralsAmt>
      <NonqlfyDeferredCompensationAmt>${r.m15.toFixed(2)}</NonqlfyDeferredCompensationAmt>
    </Form1099MISCDetail>`;
        }
    });

    xml += `
  </IRSubmission1Detail>
</IRSubmission1Grp>`;

    const transmissionNum = prompt("Enter the transmission number for this file (e.g., 1):", "1");
    if (transmissionNum === null) return; 

    const paddedNum = transmissionNum.toString().padStart(4, '0');
    const filename = `IREF${paddedNum}.XML`;

    downloadBlob(filename, xml);
}

function downloadBlob(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
