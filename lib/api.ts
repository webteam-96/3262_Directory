import clubExtraData from './club-extra-data.json';

const BASE = 'https://rotaryindiaapi.rosteronwheels.com/api';
const DIR_BASE = 'http://rotaryindiaapi.rosteronwheels.com/api';
const GROUP_ID = '31375';
const DISTRICT_NUMBER = '3262';
const YEAR = '2026-2027';

const CLUB_EXTRA: Record<string, { Club_Advisor: string; Sponsor_Club: string; Venue: string; Meeting_City: string }> = clubExtraData;

async function post(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export async function fetchCommitteeList() {
  const data = await post('/DistrictCommittee/districtCommitteeList', {
    groupID: GROUP_ID,
    searchText: '',
    yearfilter: YEAR,
  });
  const result = data?.TBDistrictCommitteeResult?.Result || {};
  return {
    withCat:    result.districtCommitteeWithCatList    || [],
    withoutCat: result.districtCommitteeWithoutCatList || [],
  };
}

export async function fetchCommitteeDetails(committeeId: string) {
  // Fetch committee members and full directory in parallel.
  // The directory call is cached for 1 hour and is the only place where
  // Address, Spouse_Name and Spouse_Photo are returned by the API.
  const [committeeRes, dirRes] = await Promise.allSettled([
    fetch(`${BASE}/DistrictCommittee/districtCommitteeDetails/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ DistrictCommitteID: committeeId, groupID: GROUP_ID }),
      next: { revalidate: 3600 },
    }),
    dirPost(
      '/Directory/Club_Details_District_Committee_PDF',
      { District_number: DISTRICT_NUMBER, year_filter: YEAR },
      3600,
    ),
  ]);

  if (committeeRes.status !== 'fulfilled' || !committeeRes.value.ok) {
    throw new Error(`API error: districtCommitteeDetails`);
  }
  const data = await committeeRes.value.json();
  const records: any[] =
    data?.TBDistrictCommitteeDetailsResult?.Result?.districtCommitteeWithoutCatList || [];

  // Build lookup from directory data keyed by RotaryID
  const dirData = dirRes.status === 'fulfilled' ? dirRes.value : null;
  const allDirMembers: any[] = [
    ...(dirData?.Member_Details || []),
    ...(dirData?.President_And_Secretary || []),
  ];
  const dirByRid: Record<string, any> = {};
  for (const m of allDirMembers) {
    const rid = (m.RotaryID || '').trim();
    if (rid && !dirByRid[rid]) dirByRid[rid] = m;
  }

  // Enrich each committee record with missing fields from directory
  return records.map((r: any) => {
    const rid = (r.RotaryID || '').trim();
    const d = rid ? dirByRid[rid] : undefined;
    if (!d) return r;
    return {
      ...r,
      Address:     r.Address     || d.Address     || '',
      MobileNumber:r.MobileNumber|| d.MobileNumber|| '',
      MailID:      r.MailID      || d.MailID      || '',
      DOB:         r.DOB         || d.DOB         || '',
      DOA:         r.DOA         || d.DOA         || '',
      Keywords:    r.Keywords    || d.Classification || d.Designation || '',
      img:         r.img         || d.imgPath     || '',
      SpouseName:  r.SpouseName  || d.Spouse_Name || '',
      SpousePhoto: r.SpousePhoto || d.Spouse_Photo|| '',
      ClubName:    r.ClubName    || d.club_Name   || '',
    };
  });
}

export async function fetchClubsBOD() {
  const data = await post('/District/Get_Clubs_BOD', {
    groupId: GROUP_ID,
    financialyear: YEAR,
  });
  return data?.ClubListResult?.Clubs || [];
}

export async function fetchClubDetails(groupId: string) {
  const data = await post('/District/Get_Clubs_BOD_Details', {
    groupId,
    financialyear: YEAR,
  });
  return data?.ClubListResult?.FinalResult || null;
}

export async function fetchClubMembers(groupId: string) {
  const data = await post('/FindClub/GetClubMembers', {
    grpID: groupId,
    searchText: '',
    financialyear: YEAR,
  });
  return data?.TBMemberList?.Result?.Table || [];
}

// ── New Directory APIs ──────────────────────────────────────────────

async function dirPost(path: string, body: object, revalidate = 0) {
  const res = await fetch(`${DIR_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    next: revalidate ? { revalidate } : undefined,
    cache: revalidate ? undefined : 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export async function fetchClubsDirectory() {
  // Fetch both APIs in parallel
  const [dirData, bodData] = await Promise.allSettled([
    dirPost('/Directory/Club_Details_District_Committee_PDF', {
      District_number: DISTRICT_NUMBER,
      year_filter: YEAR,
    }),
    post('/District/Get_Clubs_BOD', { groupId: GROUP_ID, financialyear: YEAR }),
  ]);

  const dirClubs: any[] =
    dirData.status === 'fulfilled'
      ? dirData.value?.ClubDetails_AG_Details || []
      : [];

  const bodClubs: any[] =
    bodData.status === 'fulfilled'
      ? bodData.value?.ClubListResult?.Clubs || []
      : [];

  // Primary: BOD clubs always carry grpID — use them as the authoritative list
  if (bodClubs.length > 0) {
    // Build lookup from directory data keyed by RI club ID for enrichment
    const dirMap: Record<string, any> = {};
    for (const c of dirClubs) {
      if (c.Club_id) dirMap[String(c.Club_id)] = c;
    }

    return bodClubs.map((c: any) => {
      const dir = dirMap[String(c.clubId)] || {};
      const extra = CLUB_EXTRA[String(c.clubId)];
      return {
        // directory data first for extra fields, then override critical ones from BOD
        ...dir,
        Club_Name: c.clubName || dir.Club_Name || '',
        Club_id:   String(c.clubId || dir.Club_id || ''),
        AG_name:   dir.AG_name || '',
        // grpID MUST come from BOD — it's the system routing ID
        grpID:     c.grpID ? String(c.grpID) : null,
        // Enrich missing fields from Excel data
        Club_Advisor:  dir.Club_Advisor  || extra?.Club_Advisor  || '',
        Sponsor_Club:  dir.Sponsor_Club  || extra?.Sponsor_Club  || '',
        Venue:         c.Venue           || extra?.Venue         || '',
      };
    });
  }

  // Fallback: only directory data available — no routing possible
  return dirClubs.map((c: any) => ({ ...c, grpID: null }));
}

export async function fetchDGDetails(yearFilter: string = YEAR) {
  const data = await dirPost('/Directory/get_district_governor_details_PDF', {
    year_filter: yearFilter,
  });
  return data?.DG_Details || [];
}

/* Fetch one club's full data.
   - grpId  : the system group ID (used to look up club name from BOD API)
   - Both APIs run in parallel; the large directory response is cached for 1 hour.
   - Directory data is matched by club name (case-insensitive) so ID mismatches
     between the two APIs never cause "Club not found" errors. */
export async function fetchClubFromDirectory(grpId: string) {
  const [bodRes, dirRes, membersRes] = await Promise.allSettled([
    post('/District/Get_Clubs_BOD_Details', { groupId: grpId, financialyear: YEAR }),
    dirPost(
      '/Directory/Club_Details_District_Committee_PDF',
      { District_number: DISTRICT_NUMBER, year_filter: YEAR },
      3600,
    ),
    post('/FindClub/GetClubMembers', { grpID: grpId, searchText: '', financialyear: YEAR }),
  ]);

  // Build memberName -> RIAdmissionDate lookup from the FindClub members API.
  // GetClubMembers does NOT return RotaryID, so we match by normalized name.
  const normalizeName = (s: any): string =>
    String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  const memberRows: any[] =
    membersRes.status === 'fulfilled'
      ? membersRes.value?.TBMemberList?.Result?.Table || []
      : [];
  const riAdmissionByName: Record<string, string> = {};
  for (const row of memberRows) {
    const name = normalizeName(row.memberName);
    const adm = row.RIAdmissionDate || row.RI_AdmissionDate || row.riAdmissionDate || '';
    if (name && adm) riAdmissionByName[name] = adm;
  }

  // ── BOD data (basic club meta + fallback club name) ──
  const bodResult   = bodRes.status === 'fulfilled' ? bodRes.value?.ClubListResult?.FinalResult : null;
  const bodBasic    = bodResult?.BasicInfo?.[0] || {};
  const bodClubName = (bodBasic.Club_Name || '').trim();

  // ── Directory data ──
  const dirData     = dirRes.status === 'fulfilled' ? dirRes.value : null;
  const dirClubs: any[]    = dirData?.ClubDetails_AG_Details  || [];
  const presAndSec: any[]  = dirData?.President_And_Secretary || [];
  const allMembers: any[]  = dirData?.Member_Details          || [];

  // Match directory club: try Club_id first, then case-insensitive name match
  let dirClub = dirClubs.find((c: any) => String(c.Club_id) === String(grpId));
  if (!dirClub && bodClubName) {
    dirClub = dirClubs.find(
      (c: any) => (c.Club_Name || '').trim().toLowerCase() === bodClubName.toLowerCase(),
    );
  }

  // Canonical club name for filtering pres/sec/members
  const clubName = dirClub?.Club_Name || bodClubName;
  if (!clubName) return null;

  // Build the club object: prefer directory fields, fall back to BOD
  // Venue only exists in the BOD API — always merge it in
  const bodVenue = bodBasic.Venue || '';
  const club = dirClub
    ? { ...dirClub, Venue: bodVenue }
    : {
        Club_Name:             bodClubName,
        Club_id:               bodBasic.Club_ID               || '',
        Charter_date:          bodBasic.Charter_Date           || '',
        club_meeting_day:      bodBasic.Meeting_Day            || '',
        club_meeting_from_time:bodBasic.Meeting_Time           || '',
        AG_name:               (Array.isArray(bodResult?.AG) ? bodResult.AG[0]?.Name : bodResult?.AG?.Name) || '',
        Club_Advisor:          bodBasic.Club_Advisor           || '',
        Sponsor_Club:          bodBasic.Sponsor_Club           || '',
        Venue:                 bodVenue,
      };

  // Enrich missing fields from Excel data (keyed by Club_id)
  const extra = CLUB_EXTRA[String(club.Club_id)];
  if (extra) {
    if (!club.Club_Advisor)  club.Club_Advisor  = extra.Club_Advisor;
    if (!club.Sponsor_Club)  club.Sponsor_Club  = extra.Sponsor_Club;
    if (!club.Venue)         club.Venue         = extra.Venue;
  }

  const enrich = (m: any) => {
    if (!m) return m;
    const adm = riAdmissionByName[normalizeName(m.member_name)];
    return adm ? { ...m, RIAdmissionDate: adm } : m;
  };

  const president = enrich(
    presAndSec.find(
      (m: any) => m.club_Name === clubName && m.Member_Designation === 'Club President',
    ) || null,
  );

  const secretary = enrich(
    presAndSec.find(
      (m: any) => m.club_Name === clubName && m.Member_Designation === 'Club Secretary',
    ) || null,
  );

  const members = allMembers
    .filter((m: any) => m.club_Name === clubName)
    .map(enrich);

  return { club, president, secretary, members };
}
