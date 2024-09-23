import Image from 'next/image';

interface CardProps {
  title: string;
  description: string;
  link: string;
  cardImage: string;
}

export const Card: React.FC<CardProps> = ({ title, description, link, cardImage }) => {
  return (
    <article className="duration-400 transform overflow-hidden rounded-lg bg-white shadow-none transition-transform ease-in-out hover:scale-105 hover:text-custom-green hover:shadow-lg">
      <div className="flex h-full flex-col">
        <figure className="object-top aspect-w-16 aspect-h-9 relative h-32 sm:h-52 xl:h-80 ">
        <a href={link}>
          <Image src={cardImage} alt="" fill className="h-auto w-full object-cover object-top" />
          </a>
        </figure>
        <div className="flex flex-grow flex-col md:pt-6 pt-2 md:pb-6 pb-2 p-6">
          <h2 className="mb-1 text-sm sm:text-2xl font-bold transition-colors duration-300">{title}</h2>
          <p className="mb-1 flex-grow sm:text-base text-sm leading-6 text-black">{description}</p>
          <a
            href={link}
            className="inline-flex sm:text-base text-sm items-center self-center rounded-full bg-custom-green px-4 py-2 text-white no-underline hover:text-lg focus:outline-none"
          >
            Buy Now
          </a>
        </div>
      </div>
    </article>
  );
};
