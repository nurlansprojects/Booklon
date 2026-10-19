import { BookCatalogItem } from '../types';

// Curated selection of legally public domain full-text books with real chapter content
export const PUBLIC_DOMAIN_CLASSICS: BookCatalogItem[] = [
  {
    id: 'classic-pride-and-prejudice',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    description: 'A romantic novel following the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    publisher: 'T. Egerton, Whitehall',
    publishedDate: '1813',
    pageCount: 432,
    categories: ['Classic', 'Romance', 'Literary Fiction'],
    language: 'en',
    isbn: '9780141439518',
    isFullTextAvailable: true,
    contentChapters: [
      {
        title: 'Chapter 1: The News at Longbourn',
        content: [
          'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
          'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.',
          '"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"',
          'Mr. Bennet replied that he had not.',
          '"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."',
          'Mr. Bennet made no answer.',
          '"Do you not want to know who has taken it?" cried his wife impatiently.',
          '"You want to tell me, and I have no objection to hearing it."',
          'This was invitation enough.',
          '"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."',
          '"What is his name?"',
          '"Bingley."',
          '"Is he married or single?"',
          '"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"',
          '"How so? How can it affect them?"',
          '"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."'
        ]
      },
      {
        title: 'Chapter 2: The Introduction',
        content: [
          'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.',
          'It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with: "I hope Mr. Bingley will like it, Lizzy."',
          '"We are not in a way to know what Mr. Bingley likes," said her mother resentfully, "since we are not to visit."',
          '"But you forget, mama," said Elizabeth, "that we shall meet him at the assemblies, and that Mrs. Long has promised to introduce him."',
          '"I do not believe Mrs. Long will do any such thing. She has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her."',
          '"No more have I," said Mr. Bennet; "and I am glad to find that you do not depend on her serving you."',
          'Mrs. Bennet deigned not to make any reply, but, unable to contain herself, began scolding one of her daughters.',
          '"Don\'t keep coughing so, Kitty, for Heaven\'s sake! Have a little compassion on my nerves. You tear them to pieces."',
          '"Kitty has no discretion in her coughs," said her father; "she times them ill."',
          '"I do not cough for my own amusement," replied Kitty fretfully. "When is your next ball to be, Lizzy?"'
        ]
      },
      {
        title: 'Chapter 3: The Ball at Meryton',
        content: [
          'Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley.',
          'They attacked him in various ways—with barefaced questions, ingenious suppositions, and distant surmises; but he eluded the skill of them all, and they were at last obliged to accept the second-hand intelligence of their neighbour, Lady Lucas.',
          'Her report was highly favourable. Sir William had been delighted with him. He was quite young, wonderfully handsome, extremely agreeable, and, to crown the whole, he meant to be at the next assembly with a large party.',
          'Nothing could be more delightful! To be fond of dancing was a certain step towards falling in love; and very lively hopes of Mr. Bingley\'s heart were entertained.'
        ]
      }
    ]
  },
  {
    id: 'classic-the-great-gatsby',
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    description: 'Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    publisher: 'Charles Scribner\'s Sons',
    publishedDate: '1925',
    pageCount: 180,
    categories: ['Classic', 'Literary Fiction', 'Historical'],
    language: 'en',
    isbn: '9780743273565',
    isFullTextAvailable: true,
    contentChapters: [
      {
        title: 'Chapter 1: The Green Light',
        content: [
          'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since.',
          '"Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."',
          'He didn\'t say any more, but we\'ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I\'m inclined to reserve all judgements, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.',
          'The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.',
          'Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon.',
          'Reserving judgements is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat, a sense of the fundamental decencies is parcelled out unequally at birth.',
          'And, after boasting this way of my tolerance, I come to the admission that it has a limit. Conduct may be founded on the hard rock or the wet marshes, but after a certain point I don\'t care what it\'s founded on.',
          'When I came back from the East last autumn I felt that I wanted the world to be in uniform and at a sort of moral attention forever; I wanted no more riotous excursions with privileged glimpses into the human heart. Only Gatsby, the man who gives his name to this book, was exempt from my reaction—Gatsby, who represented everything for which I have an unaffected scorn.'
        ]
      },
      {
        title: 'Chapter 2: The Valley of Ashes',
        content: [
          'About half way between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land. This is a valley of ashes—a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens; where ashes take the forms of houses and chimneys and rising smoke and, finally, with a transcendent effort, of men who move dimly and already crumbling through the powdery air.',
          'Occasionally a line of gray cars crawls along an invisible track, gives out a ghastly creak, and comes to rest, and immediately the ash-gray men swarm up with leaden spades and stir up an impenetrable cloud, which screens their obscure operations from your sight.',
          'But above the gray land and the spasms of bleak dust which drift endlessly over it, you perceive, after a moment, the eyes of Doctor T. J. Eckleburg. The eyes of Doctor T. J. Eckleburg are blue and gigantic—their retinas are one yard high. They look out of no face, but, instead, from a pair of enormous yellow spectacles which pass over a non-existent nose.'
        ]
      }
    ]
  },
  {
    id: 'classic-frankenstein',
    title: 'Frankenstein',
    authors: ['Mary Shelley'],
    description: 'Frankenstein tells the story of gifted scientist Victor Frankenstein who succeeds in giving life to a being of his own creation. However, this is not the perfect human he imagines it will be, but a hideous creature who is rejected by Victor and by mankind in general.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    publisher: 'Lackington, Hughes, Harding, Mavor & Jones',
    publishedDate: '1818',
    pageCount: 280,
    categories: ['Classic', 'Science Fiction', 'Horror', 'Gothic'],
    language: 'en',
    isbn: '9780141439471',
    isFullTextAvailable: true,
    contentChapters: [
      {
        title: 'Letter 1: To Mrs. Saville, England',
        content: [
          'St. Petersburgh, Dec. 11th, 17—',
          'You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.',
          'I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes.',
          'Inspirited by this wind of promise, my daydreams become more fervent and vivid. I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight.',
          'There, Margaret, the sun is for ever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour.'
        ]
      },
      {
        title: 'Chapter 1: Geneva and Early Years',
        content: [
          'I am by birth a Genevese, and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics, and my father had filled several public situations with honour and reputation.',
          'He was respected by all who knew him for his integrity and indefatigable attention to public business. He passed his younger days perpetually occupied by the affairs of his country; nor was it until the decline of life that he thought of marrying, and bestowing on the state sons who might carry his virtues and his name down to posterity.',
          'As the circumstances of his marriage illustrate his character, I cannot refrain from relating them. One of his most intimate friends was a merchant who, from a flourishing state, fell, through numerous mischances, into poverty. This man, whose name was Beaufort, was of a proud and unbending disposition and could not bear to live in poverty and oblivion in the same country where he had once been distinguished for his rank and magnificence.'
        ]
      }
    ]
  },
  {
    id: 'classic-sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    authors: ['Arthur Conan Doyle'],
    description: 'A collection of twelve short stories by Arthur Conan Doyle, featuring his fictional detective Sherlock Holmes and Dr. John Watson, investigating intricate mysteries across Victorian London.',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
    publisher: 'George Newnes',
    publishedDate: '1892',
    pageCount: 307,
    categories: ['Classic', 'Mystery', 'Crime'],
    language: 'en',
    isbn: '9780140437713',
    isFullTextAvailable: true,
    contentChapters: [
      {
        title: 'A Scandal in Bohemia',
        content: [
          'To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.',
          'It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.',
          'He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.',
          'He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men\'s motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.',
          'I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention.',
          'Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.'
        ]
      },
      {
        title: 'The Red-Headed League',
        content: [
          'I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.',
          'With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.',
          '"You could not have come at a better time, my dear Watson," he said cordially.',
          '"I was afraid that you were engaged."',
          '"So I am. Very much so."',
          '"Then I can wait in the next room."',
          '"Not at all. This gentleman, Mr. Wilson, has been my partner and helper in many of my most successful cases, and I have no doubt that he will be of the utmost use to me in yours also."',
          'The stout gentleman rose from his chair and gave a bob of greeting, with a quick little questioning glance from his small fat-encircled eyes.'
        ]
      }
    ]
  },
  {
    id: 'classic-alice-in-wonderland',
    title: "Alice's Adventures in Wonderland",
    authors: ['Lewis Carroll'],
    description: 'The story of Alice, a young girl who falls down a rabbit hole into a subterranean fantasy world populated by peculiar, anthropomorphic creatures.',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    publisher: 'Macmillan',
    publishedDate: '1865',
    pageCount: 192,
    categories: ['Classic', 'Fantasy', "Children's Literature"],
    language: 'en',
    isbn: '9780141439761',
    isFullTextAvailable: true,
    contentChapters: [
      {
        title: 'Chapter 1: Down the Rabbit-Hole',
        content: [
          'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"',
          'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
          'There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.',
          'In another moment down went Alice after it, never once considering in the world how in the world she was to get out again.'
        ]
      },
      {
        title: 'Chapter 2: The Pool of Tears',
        content: [
          '"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); "now I\'m opening out like the largest telescope that ever was! Good-bye, feet!" (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).',
          '"Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I\'m sure I shan\'t be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can;—but I must be kind to them," thought Alice, "or perhaps they won\'t walk the way I want to go! Let me see: I\'ll give them a new pair of boots every Christmas."'
        ]
      }
    ]
  }
];

// Helper to convert Google Books API item to BookCatalogItem
function transformGoogleBook(item: any): BookCatalogItem {
  const volumeInfo = item.volumeInfo || {};
  const id = item.id || `gb-${Math.random().toString(36).substring(7)}`;
  const title = volumeInfo.title || 'Untitled Book';
  const authors = volumeInfo.authors || ['Unknown Author'];
  const description = volumeInfo.description || 'No description available for this book.';
  const categories = volumeInfo.categories || ['General'];
  const publishedDate = volumeInfo.publishedDate || 'Unknown date';
  const pageCount = volumeInfo.pageCount || 240;
  const publisher = volumeInfo.publisher || 'Independent Publisher';
  const isbn = volumeInfo.industryIdentifiers?.[0]?.identifier || '';
  
  // High quality cover with fallback
  let coverUrl = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '';
  if (coverUrl.startsWith('http://')) {
    coverUrl = coverUrl.replace('http://', 'https://');
  }
  if (!coverUrl) {
    coverUrl = `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600`;
  }

  // Generate readable preview sections from description and synopsis
  const paragraphs = description.split('\n').filter((p: string) => p.trim().length > 0);
  const previewChapters = [
    {
      title: 'Prologue & Book Overview',
      content: [
        `Welcome to the authorized reader preview of "${title}" by ${authors.join(', ')}.`,
        description,
        `Published by ${publisher} (${publishedDate}). Total catalog volume: ${pageCount} pages.`
      ]
    },
    {
      title: 'Chapter 1: Excerpt & Highlights',
      content: paragraphs.length > 1 ? paragraphs : [
        description,
        'As you delve into this text, notice the intricate thematic development and stylistic voice crafted by the author.',
        'Track your reading position, add bookmarks, highlight important passages, and capture your personal reading reflections in Booklon.'
      ]
    }
  ];

  return {
    id,
    title,
    authors,
    description,
    coverUrl,
    publisher,
    publishedDate,
    pageCount,
    categories,
    language: volumeInfo.language || 'en',
    isbn,
    previewLink: volumeInfo.previewLink || '',
    isFullTextAvailable: false,
    contentChapters: previewChapters
  };
}

// Search books via Google Books API with graceful fallback to curated library
export async function searchBooks(query: string, category?: string): Promise<BookCatalogItem[]> {
  const trimmed = query.trim();
  
  // If query is empty and category is provided, search by subject
  let searchQuery = trimmed;
  if (!searchQuery && category && category !== 'All') {
    searchQuery = `subject:${category}`;
  } else if (category && category !== 'All') {
    searchQuery = `${trimmed}+subject:${category}`;
  }

  if (!searchQuery) {
    return PUBLIC_DOMAIN_CLASSICS;
  }

  try {
    const encoded = encodeURIComponent(searchQuery);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=20&orderBy=relevance`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Books API responded with status ${res.status}`);
    }
    const data = await res.json();
    if (data.items && Array.isArray(data.items)) {
      const books = data.items.map(transformGoogleBook);
      // Combine with any matching classics for rich full text experience
      const matchingClassics = PUBLIC_DOMAIN_CLASSICS.filter(c => 
        c.title.toLowerCase().includes(trimmed.toLowerCase()) ||
        c.authors.some(a => a.toLowerCase().includes(trimmed.toLowerCase()))
      );
      const combined = [...matchingClassics, ...books];
      // Deduplicate by title
      const seen = new Set<string>();
      return combined.filter(b => {
        const key = b.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return [];
  } catch (error) {
    console.warn('Google Books API fetch failed, falling back to local catalog:', error);
    // Fallback search within curated public domain list
    return PUBLIC_DOMAIN_CLASSICS.filter(b => {
      const matchesQuery = !trimmed || 
        b.title.toLowerCase().includes(trimmed.toLowerCase()) ||
        b.authors.some(a => a.toLowerCase().includes(trimmed.toLowerCase())) ||
        b.description.toLowerCase().includes(trimmed.toLowerCase());
      const matchesCategory = !category || category === 'All' || 
        b.categories.some(c => c.toLowerCase() === category.toLowerCase());
      return matchesQuery && matchesCategory;
    });
  }
}

// Get single book details
export async function getBookById(bookId: string): Promise<BookCatalogItem | null> {
  // Check curated classics first
  const classic = PUBLIC_DOMAIN_CLASSICS.find(b => b.id === bookId);
  if (classic) return classic;

  // Otherwise fetch from Google Books API
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
    if (res.ok) {
      const data = await res.json();
      return transformGoogleBook(data);
    }
  } catch (err) {
    console.error('Failed to get book by id from Google Books:', err);
  }
  return null;
}
