let currentFormType = 'NEC';

function switchForm(type) {
    currentFormType = type;
    
    const necTab = document.getElementById('tabNec');
    const miscTab = document.getElementById('tabMisc');
    const necFields = document.getElementById('necForm');
    const miscFields = document.getElementById('miscForm');

    if (type === 'NEC') {
        necTab.classList.add('active');
        miscTab.classList.remove('active');
        necFields.classList.remove('hidden');
        miscFields.classList.add('hidden');
    } else {
        miscTab.classList.add('active');
        necTab.classList.remove('active');
        miscFields.classList.remove('hidden');
        necFields.classList.add('hidden');
    }
}

function getVal(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    return el.value;
}

function getCheck(id) {
    const el = document.getElementById(id);
    return el && el.checked ? '1' : '0';
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
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
    const data = {
        taxYear: getVal('taxYear'),
        submissionId: getVal('submissionId'),
        issuerTin: getVal('issuerTin'),
        issuerTinType: getVal('issuerTinType'),
        issuerName: getVal('issuerName'),
        issuerAddress: getVal('issuerAddress'),
        issuerCity: getVal('issuerCity'),
        issuerState: getVal('issuerState'),
        issuerZip: getVal('issuerZip'),
        issuerPhone: getVal('issuerPhone'),
        
        contactName: getVal('contactName'),
        contactEmail: getVal('contactEmail'),

        rcpntTin: getVal('rcpntTin'),
        rcpntTinType: getVal('rcpntTinType'),
        rcpntName: getVal('rcpntName'),
        rcpntAddress: getVal('rcpntAddress'),
        rcpntCity: getVal('rcpntCity'),
        rcpntState: getVal('rcpntState'),
        rcpntZip: getVal('rcpntZip'),

        voidInd: getCheck('voidInd'),
        correctedInd: getCheck('correctedInd'),
        secondTinNotice: getCheck('secondTinNotice')
    };

    let xml = `<?xml version="1.0" encoding="utf-16"?>
<IRSubmission1Grp xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="urn:us:gov:treasury:irs:ir">
  <IRSubmission1Header>
    <SubmissionId>${escapeXml(data.submissionId)}</SubmissionId>
    <TaxYr>${escapeXml(data.taxYear)}</TaxYr>
    <IssuerDetail>
      <ForeignEntityInd>0</ForeignEntityInd>
      <TIN>${escapeXml(data.issuerTin.replace(/\D/g, ''))}</TIN>
      <TINSubmittedTypeCd>${escapeXml(data.issuerTinType)}</TINSubmittedTypeCd>
      <BusinessName>
        <BusinessNameLine1Txt>${escapeXml(data.issuerName)}</BusinessNameLine1Txt>
      </BusinessName>
      <MailingAddressGrp>
        <USAddress>
          <AddressLine1Txt>${escapeXml(data.issuerAddress)}</AddressLine1Txt>
          <CityNm>${escapeXml(data.issuerCity)}</CityNm>
          <StateAbbreviationCd>${escapeXml(data.issuerState)}</StateAbbreviationCd>
          <ZIPCd>${escapeXml(data.issuerZip)}</ZIPCd>
        </USAddress>
      </MailingAddressGrp>
      <PhoneNum>${escapeXml(data.issuerPhone.replace(/\D/g, ''))}</PhoneNum>
    </IssuerDetail>`;

    if (data.contactName || data.contactEmail) {
        xml += `
    <ContactPersonInformationGrp>
      <ContactPersonNm>${escapeXml(data.contactName)}</ContactPersonNm>
      <ContactEmailAddressTxt>${escapeXml(data.contactEmail)}</ContactEmailAddressTxt>
    </ContactPersonInformationGrp>`;
    }

    xml += `
    <FormTypeCd>1099${currentFormType}</FormTypeCd>
    <ParentFormTypeCd>1096</ParentFormTypeCd>
    <CFSFElectionInd>0</CFSFElectionInd>
    <TotalReportedRcpntFormCnt>1</TotalReportedRcpntFormCnt>
    <IRSubmission1FormTotals>`;

    if (currentFormType === 'NEC') {
        const amt1 = parseFloat(getVal('nec1') || 0).toFixed(2);
        xml += `
      <Form1099NECTotalAmtGrp>
        <NonemployeeCompensationAmt>${amt1}</NonemployeeCompensationAmt>
      </Form1099NECTotalAmtGrp>`;
    } else {
        const amt1 = parseFloat(getVal('misc1') || 0).toFixed(2);
        xml += `
      <Form1099MISCTotalAmtGrp>
        <RentAmt>${amt1}</RentAmt>
      </Form1099MISCTotalAmtGrp>`;
    }

    xml += `
    </IRSubmission1FormTotals>
  </IRSubmission1Header>
  <IRSubmission1Detail>`;

    if (currentFormType === 'NEC') {
        const amt1 = parseFloat(getVal('nec1') || 0).toFixed(2);
        const ind2 = getCheck('nec2');
        const amt3 = parseFloat(getVal('nec3') || 0).toFixed(2);
        const amt4 = parseFloat(getVal('nec4') || 0).toFixed(2);

        xml += `
    <Form1099NECDetail>
      <TaxYr>${escapeXml(data.taxYear)}</TaxYr>
      <RecordId>1</RecordId>
      <VoidInd>${data.voidInd}</VoidInd>
      <CorrectedInd>${data.correctedInd}</CorrectedInd>
      <RecipientDetail>
        <TIN>${escapeXml(data.rcpntTin.replace(/\D/g, ''))}</TIN>
        <TINSubmittedTypeCd>${escapeXml(data.rcpntTinType)}</TINSubmittedTypeCd>
        <PersonName>
          <PersonFirstNm>${escapeXml(data.rcpntName)}</PersonFirstNm>
        </PersonName>
        <MailingAddressGrp>
          <USAddress>
            <AddressLine1Txt>${escapeXml(data.rcpntAddress)}</AddressLine1Txt>
            <CityNm>${escapeXml(data.rcpntCity)}</CityNm>
            <StateAbbreviationCd>${escapeXml(data.rcpntState)}</StateAbbreviationCd>
            <ZIPCd>${escapeXml(data.rcpntZip)}</ZIPCd>
          </USAddress>
        </MailingAddressGrp>
      </RecipientDetail>
      <SecondTINNoticeInd>${data.secondTinNotice}</SecondTINNoticeInd>
      <NonemployeeCompensationAmt>${amt1}</NonemployeeCompensationAmt>
      <DirectSaleAboveThresholdInd>${ind2}</DirectSaleAboveThresholdInd>
      <ExcessParachutePaymentAmt>${amt3}</ExcessParachutePaymentAmt>
      <FederalIncomeTaxWithheldAmt>${amt4}</FederalIncomeTaxWithheldAmt>
    </Form1099NECDetail>`;
    } else {
        const m1 = parseFloat(getVal('misc1') || 0).toFixed(2);
        const m2 = parseFloat(getVal('misc2') || 0).toFixed(2);
        const m3 = parseFloat(getVal('misc3') || 0).toFixed(2);
        const m4 = parseFloat(getVal('misc4') || 0).toFixed(2);
        const m5 = parseFloat(getVal('misc5') || 0).toFixed(2);
        const m6 = parseFloat(getVal('misc6') || 0).toFixed(2);
        const m7 = getCheck('misc7');
        const m8 = parseFloat(getVal('misc8') || 0).toFixed(2);
        const m9 = parseFloat(getVal('misc9') || 0).toFixed(2);
        const m10 = parseFloat(getVal('misc10') || 0).toFixed(2);
        const m11 = parseFloat(getVal('misc11') || 0).toFixed(2);
        const m12 = parseFloat(getVal('misc12') || 0).toFixed(2);
        const m13 = getCheck('misc13');
        const m15 = parseFloat(getVal('misc15') || 0).toFixed(2);

        xml += `
    <Form1099MISCDetail>
      <TaxYr>${escapeXml(data.taxYear)}</TaxYr>
      <RecordId>1</RecordId>
      <VoidInd>${data.voidInd}</VoidInd>
      <CorrectedInd>${data.correctedInd}</CorrectedInd>
      <RecipientDetail>
        <TIN>${escapeXml(data.rcpntTin.replace(/\D/g, ''))}</TIN>
        <TINSubmittedTypeCd>${escapeXml(data.rcpntTinType)}</TINSubmittedTypeCd>
        <PersonName>
          <PersonFirstNm>${escapeXml(data.rcpntName)}</PersonFirstNm>
        </PersonName>
        <MailingAddressGrp>
          <USAddress>
            <AddressLine1Txt>${escapeXml(data.rcpntAddress)}</AddressLine1Txt>
            <CityNm>${escapeXml(data.rcpntCity)}</CityNm>
            <StateAbbreviationCd>${escapeXml(data.rcpntState)}</StateAbbreviationCd>
            <ZIPCd>${escapeXml(data.rcpntZip)}</ZIPCd>
          </USAddress>
        </MailingAddressGrp>
      </RecipientDetail>
      <SecondTINNoticeInd>${data.secondTinNotice}</SecondTINNoticeInd>
      <FATCAFilingRequirementInd>${m13}</FATCAFilingRequirementInd>
      <RentAmt>${m1}</RentAmt>
      <RoyaltyAmt>${m2}</RoyaltyAmt>
      <OtherIncomeAmt>${m3}</OtherIncomeAmt>
      <FederalIncomeTaxWithheldAmt>${m4}</FederalIncomeTaxWithheldAmt>
      <FishingBoatProceedsAmt>${m5}</FishingBoatProceedsAmt>
      <MedicalHealthCarePaymentsAmt>${m6}</MedicalHealthCarePaymentsAmt>
      <DirectSaleAboveThresholdInd>${m7}</DirectSaleAboveThresholdInd>
      <SubstitutePaymentsAmt>${m8}</SubstitutePaymentsAmt>
      <CropInsuranceProceedsAmt>${m9}</CropInsuranceProceedsAmt>
      <AttorneyGrossProceedsPaidAmt>${m10}</AttorneyGrossProceedsPaidAmt>
      <FishPurchasedForResaleAmt>${m11}</FishPurchasedForResaleAmt>
      <Section409ADeferralsAmt>${m12}</Section409ADeferralsAmt>
      <NonqlfyDeferredCompensationAmt>${m15}</NonqlfyDeferredCompensationAmt>
    </Form1099MISCDetail>`;
    }

    xml += `
  </IRSubmission1Detail>
</IRSubmission1Grp>`;

    const transmissionNum = prompt("Enter the transmission number for this file (e.g., 1):", "1");
    if (transmissionNum === null) return; // User cancelled

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
