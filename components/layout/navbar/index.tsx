import CartModal from 'components/cart/modal';
import LogoSquare from 'components/logo-square';
import SigninButton from 'components/signin-button';
import { getMenu } from 'lib/wix';
import { Menu } from 'lib/wix/types';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';

interface ProfilePhoto {
  id: string;
  url: string;
  height: number;
  width: number;
}

interface Profile {
  nickname: string;
  slug: string;
  photo: ProfilePhoto;
  title: string;
}

interface Member {
  id: string;
  status: string;
  profile: Profile;
  privacyStatus: string;
  activityStatus: string;
  createdDate: string;
  updatedDate: string;
}

interface NavbarProps {
  member?: Member | null; // Make it optional or nullable if needed
}


export async function Navbar({ member }: NavbarProps) {
  const fetchedMenu = await getMenu('next-js-frontend-header-menu');

  const menuToDisplay = fetchedMenu.slice(0, 5);
  const dropdownMenuItems = fetchedMenu.slice(5);
  
  const profileImageUrl = member?.profile?.photo?.url ? `https:${member.profile.photo.url}` : '';

  return (
    <nav className="relative flex items-center justify-between bg-white p-4 lg:px-6">
      <div className="block flex-none lg:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={fetchedMenu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
          </Link>
        </div>
        <div className="relative ml-4 mr-4 flex flex-grow">
          <ul className="hidden gap-6 text-sm md:items-center lg:flex">
            {menuToDisplay.map((item: Menu) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className="text-justify align-middle text-neutral-500 underline-offset-4 hover:text-black hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            {dropdownMenuItems.length > 0 && (
              <li className="group relative">
                <button className="text-neutral-500 underline-offset-4 hover:text-black hover:underline">
                  More
                </button>
                <ul className="absolute left-1/2 top-full z-50 hidden w-48 -translate-x-1/2 transform bg-white shadow-lg group-hover:block">
                  {dropdownMenuItems.map((item: Menu) => (
                    <li key={item.title}>
                      <Link
                        href={item.path}
                        prefetch={true}
                        className="block px-4 py-2 text-sm text-neutral-500 hover:bg-gray-100"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </div>
        <div className="flex items-center justify-between">
          <div className="mr-4 hidden justify-center md:flex">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          <CartModal />
          {member ? (
            <div className="flex items-center">
              {profileImageUrl && (
                <img 
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                />
              )}
              <button className="text-neutral-500">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="ml-4">
              <SigninButton onClick={undefined} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
