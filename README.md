a3-edbutler-piscean
===================

Brief Description
-----------

Our site visualizes aggregate data of chord progression in songs, showing the relative fequencies of various chord transitions for a set of songs. The interface allows the user to filter by chord subsequence, artist, and title. It provides links to visualizations of the chord progressions of individual songs, as well as interactions for looking at the individual data points by hovering over elements of the visualization.

The application is just static web content. However, it downloads a json file via AJAX, so it must be run from a webserver due to security limitations in browsers. The [github.io page](http://cse512-14w.github.io/a3-edbutler-piscean/) works, or you can self host with something like `python3 -m http.server <port>`.

Part 1 Plan and Storyboard
----------

We chose to create a visualization to explore chord progressions in songs. Which kinds of progressions are common, which songs use certain progressions, what do progression typically look like for certain artists or genres? Though a comprehensive database of chord progressions in popular music does not exist, we found a webiste whose owners were kind enough to share their database of segments from a couple thousand songs, created by crowdsourced analysis.

They have done [these static visualizations](http://www.hooktheory.com/blog/i-analyzed-the-chords-of-1300-popular-songs-for-patterns-this-is-what-i-found/) from [www.hooktheory.com](http://www.hooktheory.com) in the past. Additionally, the site already provides [a global visualization](http://www.hooktheory.com/trends) of this data, that allows users to crawl through chord progression prefixes and find matching songs, with links to [song-specific visualizations](http://www.hooktheory.com/analysis).

In contrast, rather than visualizing only the chord prefixes, we wanted to create an aggregate visualization of chord progressions, showing the general way chords flow throughout the song. Specifically, we want to take a group a songs, count the number of transitions between certain chords (e.g., I -> IV, V -> I), and visualize the relative frequencies of these transitions. Since our data consists of a double-directed graph (whose nodes also naturally form a circle), a [chord diagram](http://bl.ocks.org/mbostock/4062006) seems like an appropriate encoding.

The primary use we wish to facilitate is viewing of chord progression trends for songs in different genres, by different artists, or with different chord progression subsequences. Therefore, filtering is the most important interaction technique. The user can enter queries (e.g., songs that contain a I-IV-V-I progression), and the chord diagram will animate into a new chord diagram that shows data only for songs matching the criteria, as shown below.

<img src="storyboard/page3.png" width="600">

To help with viewing an individual diagram, the chord will support viewing a single group at a time and additional pop-up details. When the user hovers over a group, it will fade out the other groups. When the user hovers over groups or chords, tooltips will show the data for those elements.

<img src="storyboard/page2.png" width="500">

So that the user can futher drill-down into individual songs, we show a list of all songs matching the current search criteria, and provide links to Hooktheory's interative visualizations of the individual songs. These visualization allow the user to see and hear the chord progression of a specific song. Our chart shows an aggregation of chord progression, so it's not possible for the user to see any individual sequences. This feature that provides links to visuzliations of individual sequences helps overcome shortcomings in our visualization.

<img src="storyboard/page4.png" width="400">

Here's a sketch of the overall interface. Visualization of the current selection is the chord diagram on the left. The right side provides text boxes in which to enter search queries, and the large text area provides links to songs that match the search criteria. This filtering will happen live as the user types in the search box.

<img src="storyboard/page1.png" width="400">

Here's a static visualization of the full dataset. We arrange the hues for each node in a color circle to emphasize the circular nature of the nodes. Rather than viewing all possible types of chords (e.g., V vs. V7 vs. Vsus4), we collapse all chords to the mode of their root (the numbers 1-7) and remove self-transitions. Thus, the major third (III) and minor third (iii) are both represented by the number 3, etc.

<img src="storyboard/test.png" width="400">

Development Process, Differences Between Storyboard and Final
------------

We failed to think about some edge cases when storyboarding. For example, what happens when the search query is empty? Chord diagrams do not have a natural "no data" state, so we hide the visualiation completely when there are no results.

Work was split on a fine-grained task basis. Broadly, Eric handled most of the web code and Rahul transformed data from the xml file we were given into a cleaned json format for our application. We spent approximately 30 hours of work between the two of us. The most challenging aspsects were probably transforming the data correctly and making animations and transitions for the chord diagram smooth. Since naive interpolation of the elements in a chord diagram looks awful and does not make sense, we had to roll a custom animation system, which took a few iterations to get correct.

The dataset turned out not to have genre information. We attempted to gather an external dataset to match up the songs with genre information, but this proved too difficult in the time period allotted. While we feel the visualization is weakened significantly without the ability to do genre search, this is something that can be added easily when the dataset improves.

Another problem we encountered is that the dataset is rather sparse and covers an odd set of songs, which is expected since it's created by volunteer crowdsourcing. For example, it has several pop songs, and surprising things like the Sailor Moon theme song and obscure video game OSTs. This undermines the value of "search by artist" since artists are rarely well-represented. Also because of crowdsourcing, there are several poorly-transcribed songs with questionable progressions. However, like the problem with genre, these will go away as the dataset improves with no change to the visualization. This is the best dataset we could find.
