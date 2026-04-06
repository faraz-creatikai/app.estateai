{/* Assign to customer popup */}
        {/* {isAssignOpen && (selectedCustomers.length > 0) && (
          <PopupMenu onClose={() => setIsAssignOpen(false)}>
            <div className="flex flex-col gap-8 py-6 px-2 m-2 bg-white  w-full max-w-[400px] rounded-md">
              <h2 className="text-2xl text-[var(--color-secondary-darker)] px-6 font-extrabold">Assign <span className=" text-[var(--color-primary)]">Customers</span></h2>
              <div className=" max-h-[40vh] flex flex-col gap-2 overflow-y-auto">
                {users.map((user, index) => {
                  return <div key={user._id + index}>
                    <label className=" flex justify-between gap-2 cursor-pointer px-6 py-2 hover:bg-gray-200">


                      <div>{user.name}</div>
                      <input
                        type="checkbox"
                        checked={selectedUser === user._id}
                        onChange={() => handleSelectUser(user._id)}
                      />

                    </label>

                  </div>
                })}
                {
                  users.length === 0 && <div className=" flex justify-center items-center py-2 px-4 text-gray-400">
                    No user available at the movement
                  </div>
                }
              </div>
              <div className="flex justify-between px-6 items-center">
                <button
                  className="text-[#C62828] bg-[#FDECEA] hover:bg-red-200/60 cursor-pointer rounded-md px-4 py-2"
                  onClick={handleAssignto}
                >
                  Assign
                </button>
                <button
                  className="cursor-pointer text-blue-800 hover:bg-gray-200 rounded-md px-4 py-2"
                  onClick={() => setIsAssignOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </PopupMenu>
        )} */}