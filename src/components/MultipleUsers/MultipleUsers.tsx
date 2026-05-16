import './MultipleUsers.css';

export interface Users {
    userName: string;
}

export default function MultipleUsers({ users, limit = 5 }: { users: Users[], limit?: number }) {

    function getShortName(name: string): string {
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
            return nameParts[0][0] + nameParts[1][0];
        }
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <>
            <div className='user-icon-container'>
                {users && users?.map((user: Users, index: number) => (
                    (index < limit - 1) && <div key={user.userName} className='user-icon' style={{ left: '-' + (index * 5) + 'px' }}>
                        {getShortName(user.userName)}
                    </div>)
                )}
                {users?.length > limit && <div className='user-icon' style={{ left: '-' + ((limit - 1) * 5) + 'px' }}>
                    +{users.length - limit}
                </div>}
            </div>
        </>
    );
}