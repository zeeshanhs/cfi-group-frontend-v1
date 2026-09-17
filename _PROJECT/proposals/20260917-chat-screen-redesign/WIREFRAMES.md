# Data Insights Chat — revised ASCII wireframes

Revision 2.0. These are structural wireframes; exact behavior and dimensions are defined in `SCREEN_SPECIFICATIONS.md`.

## WF-01 — New chat, desktop

```text
+--------------------------------------------------------------------------------------------------+
| CFI Group | Data Insights Chat                                  [All features] Jordan Ellis [JE] |
+----------------------+---------------------------------------------------------------------------+
| [     New chat      ] | Ask about your data             Synthetic demo · Fictional data · UTC   |
|                      +---------------------------------------------------------------------------+
| RECENT CHATS         |                                                                           |
| No saved chats yet.  |                         SYNTHETIC DATA INSIGHTS                           |
|                      |                                                                           |
|                      |                      What would you like to know?                          |
|                      |             Ask about bids, people, jobs, or a reporting period.          |
|                      |                                                                           |
|                      |   .-------------------------------------------------------------------.   |
|                      |  ( [Browse prompts]  Your question · Ask...     (mic)  [Send ->]       )  |
|                      |   '-------------------------------------------------------------------'   |
|                      |       Demo voice input · simulated; microphone is not accessed.            |
|                      |                                                                           |
|                      |   Try a prompt                                                            |
|                      |   +--------------------------------+  +--------------------------------+   |
|                      |   | How many bids were created     |  | Compare bids by account       |   |
|                      |   | last month?                    |  | manager this month.           |   |
|                      |   +--------------------------------+  +--------------------------------+   |
|                      |   +--------------------------------+  +--------------------------------+   |
|                      |   | Show jobs with bids created    |  | Create a weekly bid activity  |   |
|                      |   | in the past seven days.        |  | report.                        |   |
|                      |   +--------------------------------+  +--------------------------------+   |
+----------------------+---------------------------------------------------------------------------+
```

The centered composition exists only before the first message. Suggested prompts insert text; they do not auto-send.

## WF-02 — New chat with prompt browser open

```text
|                      |   .-------------------------------------------------------------------.   |
|                      |  ( [Browse prompts]  Your question · Ask...     (mic)  [Send ->]       )  |
|                      |   '-------------------------------------------------------------------'   |
|                      |          +-------------------------------------------------------+        |
|                      |          | Browse prompts                               [Close]   |        |
|                      |          | [ Search prompts...                                  ] |        |
|                      |          | [All] [Bids] [Account managers] [Jobs] [Monthly] -->  |        |
|                      |          | 12 prompts                                            |        |
|                      |          |-------------------------------------------------------|        |
|                      |          | Bid activity last month                               |        |
|                      |          | Count bids created in the previous month · Bids       |        |
|                      |          |-------------------------------------------------------|        |
|                      |          | Weekly bid activity report                            |        |
|                      |          | Create a seven-day report · Weekly reports             |        |
|                      |          |-------------------------------------------------------|        |
|                      |          | ... scrollable results ...                            |        |
|                      |          +-------------------------------------------------------+        |
```

The desktop browser is a nonmodal popover with form controls, not an ARIA menu. Selection closes it, fills the composer, and returns focus to the textarea.

## WF-03 — Ongoing chat, floating composer

```text
+----------------------+---------------------------------------------------------------------------+
| [     New chat      ] | Conversation title              Synthetic demo · Fictional data · UTC   |
|                      +---------------------------------------------------------------------------+
| RECENT CHATS         |  YOU                                                                      |
| | Conversation title|  How many bids did Casey Patel create in the past seven days?              |
|                      |                                                                           |
|                      |  DATA INSIGHTS                                                            |
|                      |  Casey Patel created 18 bids from 9–15 September 2026.                     |
|                      |                                                                           |
|                      |  YOU                                                                      |
|                      |  How many has he won?                                                      |
|                      |                                                                           |
|                      |  DATA INSIGHTS                                                            |
|                      |  This prototype supports a bounded set of fictional questions...          |
|                      |                                                                           |
|                      |                . . . white-to-transparent fade . . .                       |
|                      |     .-----------------------------------------------------------------.   |
|                      |    ( [lib]  Your question · Ask...           (mic)  [Send ->]          )  |
|                      |     '-----------------------------------------------------------------'   |
|                      |       Demo voice input · simulated; microphone is not accessed.            |
|                      |                    quiet bottom breathing / safe area                       |
+----------------------+---------------------------------------------------------------------------+
```

There is no opaque full-width composer band. The transcript scrolls behind the local fade and has enough bottom padding to place its last message completely above the pill.

## WF-04 — Ongoing chat, six-line maximum

```text
|                      |  [latest transcript content]                                               |
|                      |                                                                           |
|                      |                . . . white-to-transparent fade . . .                       |
|                      |     .-----------------------------------------------------------------.   |
|                      |    / [lib]  Compare bids created by Casey Patel                         \  |
|                      |   |         with bids created by Jordan Ellis                            | |
|                      |   |         over the last 30 days and explain                            | |
|                      |   |         which creation-date field is used.                           | |
|                      |   |         Include totals by week.                                      | |
|                      |    \        Add a concise summary.          (mic)  [Send ->]           /  |
|                      |     '-----------------------------------------------------------------'   |
|                      |       Demo voice input · simulated.                          412 / 4,000  |
+----------------------+---------------------------------------------------------------------------+
```

Line seven scrolls inside the textarea. The pill stops growing and transcript bottom padding stops increasing.

## WF-05 — Recording, transcribing, and review

```text
RECORDING
     .-----------------------------------------------------------------------------------------.
    ( Existing draft...        Recording · 00:23 / 02:00          (stop)  [Cancel]              )
     '-----------------------------------------------------------------------------------------'

TRANSCRIBING
     .-----------------------------------------------------------------------------------------.
    ( Existing draft...        Transcribing...                     [Cancel transcription]        )
     '-----------------------------------------------------------------------------------------'

TRANSCRIPT REVIEW
     .-----------------------------------------------------------------------------------------.
    ( [discard]  Show all bids Casey created last week...                 [Send ->]              )
     '-----------------------------------------------------------------------------------------'
       Transcript added. Review before sending.
```

All voice controls remain inside the pill. State labels, not color alone, communicate progress.

## WF-06 — Processing, error, and new answer

```text
PROCESSING
|  | Data Insights is preparing a simulated answer...                                           |
|                    . . . fade . . .                                                            |
|      ( [lib]  Input disabled...                       (mic)  [Send] )                            |
|        Waiting for this reply before you can send another question.                            |

INPUT ERROR
|                    . . . fade . . .                                                            |
|      ( [lib]  [long draft scrolls internally]         (mic)  [Send] )                           |
|        Shorten your question before sending · 4,037 / 4,000                                    |

SCROLLED AWAY
|                                              [ New answer v ]                                  |
|                    . . . fade . . .                                                            |
|      ( [lib]  Ask a question...                       (mic)  [Send] )                            |
```

## WF-07 — Canvas open, desktop split

```text
+--------------------------------------------------------------------------------------------------+
| CFI Group | Data Insights Chat                                  [All features] Jordan Ellis [JE] |
+----------------------+-----------------------------------+---------------------------------------+
| [     New chat      ] | Conversation title                | Report title               [Close]   |
| RECENT CHATS         | Synthetic · Fictional · UTC       | 18 fictional rows · UTC              |
| | Conversation title+-----------------------------------+---------------------------------------+
|                      | YOU                               | Bid ID | Title | Created | Owner ...  |
|                      | Show the report...                |--------+-------+---------+------------|
|                      |                                   | ...                                   |
|                      | DATA INSIGHTS                     |                                       |
|                      | [report attachment]               |   CANVAS USES FULL AVAILABLE HEIGHT   |
|                      |                                   |                                       |
|                      |       . . . local fade . . .      |                                       |
|                      |  .-----------------------------.  |                                       |
|                      | ( [lib] Ask... (mic) [send icon]) |                                       |
|                      |  '-----------------------------'  |                                       |
|                      |   Simulated; no microphone.       |                [Prev] Page 1 [Next]   |
+----------------------+-----------------------------------+---------------------------------------+
```

The chat pane clips its overlay. Fade, pill, shadow, tooltips, focus rings, and prompt browser never enter the canvas column. The canvas reserves no row for the composer.

## WF-08 — New chat, mobile

```text
+--------------------------------------+
| [Chats]  CFI Group              [JE] |
+--------------------------------------+
| Data Insights Chat                   |
| Synthetic demo · Fictional data · UTC|
+--------------------------------------+
| SYNTHETIC DATA INSIGHTS              |
|                                      |
| What would you like to know?         |
| Ask about bids, people, jobs, or a   |
| reporting period.                    |
|                                      |
| .----------------------------------. |
| ( [L] Question · Ask... (m) [^] ) |
| '----------------------------------' |
| Simulated; microphone not accessed. |
|                                      |
| Try a prompt                         |
| +----------------------------------+ |
| | How many bids were created last | |
| | month?                           | |
| +----------------------------------+ |
| +----------------------------------+ |
| | Create a weekly bid report.     | |
| +----------------------------------+ |
+--------------------------------------+
```

## WF-09 — Prompt browser, mobile bottom sheet

```text
+--------------------------------------+
| [dimmed new-chat workspace]          |
|                                      |
| +----------------------------------+ |
| | Browse prompts            [Close]| |
| | [ Search prompts...             ]| |
| | [All] [Bids] [Jobs] [Monthly] -> | |
| | 8 prompts                        | |
| |----------------------------------| |
| | Bid activity last month          | |
| | Count bids created... · Bids     | |
| |----------------------------------| |
| | Weekly bid activity report       | |
| | Create a seven-day... · Weekly   | |
| |----------------------------------| |
| | ... scrollable results ...       | |
| +----------------------------------+ |
+--------------------------------------+
```

## WF-10 — Ongoing chat with software keyboard

```text
+--------------------------------------+
| [Chats]  CFI Group              [JE] |
+--------------------------------------+
| Conversation · Synthetic · UTC       |
+--------------------------------------+
| DATA INSIGHTS                        |
| [latest visible answer excerpt]      |
|                                      |
|           . . . fade . . .           |
| .----------------------------------. |
| ( [L] Question · Compare... (m)[^])|
| '----------------------------------' |
| Simulated; microphone not accessed. |
+--------------------------------------+
|                                      |
|          SOFTWARE KEYBOARD           |
|                                      |
+--------------------------------------+
```

The composer follows the visual viewport. The transcript shrinks; the page and canvas do not scroll behind it.
