"use client";

import ScannerPanel from "./scanner/ScannerPanel";
import CheckInHeader from "./layout/CheckInHeader";
import AttendanceProgress from "./cards/AttendanceProgress";
import StatsGrid from "./cards/StatsGrid";
import GuestSearchPanel from "./search/GuestSearchPanel";
import RecentActivityPanel from "./activity/RecentActivityPanel";
import {
  CheckInLoadingState,
  WorkspaceLoadingState,
} from "./states/LoadingStates";
import NoEventsState from "./states/NoEventsState";
import NoAccessState from "./states/NoAccessState";
import { formatMethod, formatTime } from "./utils/formatters";
import CheckInResultOverlay from "./results/CheckInResultOverlay";
import { useCheckInWorkspace } from "./hooks/useCheckInWorkspace";

export default function HostCheckInPage() {
  const {
    organizerEvents,
    eventId,
    setEventId,
    scannerActive,
    setScannerActive,
    manualCode,
    setManualCode,
    search,
    setSearch,
    gate,
    setGate,
    isSubmitting,
    result,
    setResult,
    scannerInputRef,
    workspace,
    filteredGuests,
    attendancePercentage,
    submitCode,
    performCheckIn,
    handleManualSubmit,
    handleScannerSubmit,
    handleUndo,
  } = useCheckInWorkspace();

  if (organizerEvents === undefined) {
    return <CheckInLoadingState />;
  }

  if (organizerEvents.length === 0) {
    return <NoEventsState />;
  }

  return (
    <div className="space-y-6 pb-10">
      <CheckInHeader
        events={organizerEvents}
        eventId={eventId}
        gate={gate}
        onEventChange={(nextEventId) => {
          setEventId(nextEventId);
          setResult(null);
          setSearch("");
          setManualCode("");
        }}
        onGateChange={setGate}
      />

      {workspace === undefined ? (
        <WorkspaceLoadingState />
      ) : workspace === null ? (
        <NoAccessState />
      ) : (
        <>
          <AttendanceProgress
            eventName={workspace.event.name}
            dateString={workspace.event.dateString}
            venueName={workspace.event.venueName}
            location={workspace.event.location}
            checkedIn={workspace.stats.checkedIn}
            totalGuests={workspace.stats.totalGuests}
            attendancePercentage={attendancePercentage}
          />

          <StatsGrid
            checkedIn={workspace.stats.checkedIn}
            remaining={workspace.stats.remaining}
            totalGuests={workspace.stats.totalGuests}
            orders={workspace.stats.orders}
            attendancePercentage={attendancePercentage}
          />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <div className="space-y-6">
              <ScannerPanel
                scannerActive={scannerActive}
                gate={gate}
                isSubmitting={isSubmitting}
                manualCode={manualCode}
                scannerInputRef={scannerInputRef}
                onScannerActiveChange={setScannerActive}
                onManualCodeChange={setManualCode}
                onScannerSubmit={handleScannerSubmit}
                onManualSubmit={handleManualSubmit}
                onScan={(value) => submitCode(value, "qr")}
                onCameraError={(message) => {
                  setResult({
                    status: "error",
                    guestName: "Camera unavailable",
                    ticketType: "",
                    quantity: 0,
                    message,
                  });
                }}
              />

              <GuestSearchPanel
                guests={filteredGuests}
                search={search}
                onSearchChange={setSearch}
                isSubmitting={isSubmitting}
                onCheckIn={(ticketId) =>
                  performCheckIn(ticketId, "search")
                }
                onUndo={handleUndo}
              />
            </div>

            <RecentActivityPanel
              recentActivity={workspace.recentActivity}
              formatMethod={formatMethod}
              formatTime={formatTime}
            />
          </section>
        </>
      )}

      {result ? (
        <CheckInResultOverlay
          result={result}
          onClose={() => {
            setResult(null);
            scannerInputRef.current?.focus();
          }}
        />
      ) : null}


    </div>
  );
}

