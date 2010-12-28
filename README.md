# Conch: Coordinate podcasts and conference calls

Conch is a simple web application to help conference calls go more smoothly.
VoIP calls have so much lag. Conch reduces interruption wars 
using a simple raise-your-hand mechanism and the honor system.

Conch is like the conch shell in William Golding's novel, *Lord of the
Flies*:

<blockquote>
&ldquo;And another thing. We can&rsquo;t have everybody talking at once.
We&rsquo;ll have to have &rsquo;Hands up&rsquo; like at school.&rdquo;
<br/>
He held the conch before his face and glanced round the mouth.
<br/>
&ldquo;Then I&rsquo;ll give him the conch.&rdquo;
<br/>
&ldquo;Conch?&rdquo;
<br/>
&ldquo;That&rsquo;s what this shell&rsquo;s called. I&rsquo;ll give the
conch to the next person to speak. He can hold it when he&rsquo;s
speaking&rdquo;
<br/>
&ldquo;But&mdash;&rdquo;
<br/>
&ldquo;Look&mdash;&rdquo;
<br/>
&ldquo;And he won&rsquo;t be interrupted: Except by me.&rdquo;
</blockquote>

## To Do

Features go here. For bugs, see the issue tracker.

* No login. No cookies. Just total honor system. Two logins from same browser is
  possible.
* Basic vs. Advanced view. Advanced shows more info. Items marked "(A)" are
  advanced-only.
* Simple URL schema. /foo goes to room "foo" which is reset weekly.
* Speaker has the conch
* Request the conch next (hand-up)
* Cancel hand-up
* Big button to yield conch to hand-up
* Some way to yield (assign) conch to anybody
* Request interrupt (IRQ). An interrupt is a different request to speak:

  * Urgent: conch made an error, requester knows answer to a question, etc.
  * Brief: just a quick, simple statement or inquiry
  * Conch automatically returns to previous owner when interrupt is done

* Cancel IRQ
* Big button to yield to interrupt
* Some way to yield (assign) interrupt to anybody
* Vertical list of participants. Conch is always at the top. When Conch yields,
  two options are possible:

  * Round table mode: Old conch goes to the bottom, new conch goes to top, and
    everybody else moves up 1. The person who spoke longest ago is nearest the
    top, reminding them to participate.
  * Fish bowl mode: Old conch moves down 1, new conch goes to top. Those who
    don't speak much sink to the bottom permanently.

* Auto-assign goofy names by default
* Change my name
* Password-protect session
* Anybody can submit the current state and it's simply a no-op if no change.
  In other words, you should never have to "fix" Conch's state to continue (A)
* Simple text chat
* Everybody's ping times are known: to server, from server, round trip (A)
* Form to enter topic for your hand-up (possibly IRQ) (A)
* IRQ triggers an audible bell
* Entire background indicates state-at-a-glance: in the clear, a hand is up,
  pending IRQ, etc. So you can move the window aside and not hurt the flow.
* Constant monitoring of server with big warning (possibly disable UI) if a
  disconnect is detected.
* Each user has a last-ping field that can hint whether they lost signal. E.g.
  if their last ping was 3m ago maybe their WiFi dropped.
* Stats

  * Conch-time per person
  * Hand-up time per person
  * IRQ time per person
  * Best/worst speaker based on time to yield to IRQ
